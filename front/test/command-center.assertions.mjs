// Run with: node test/command-center.assertions.mjs
// Executes the real TS / Vue setup code with isolated auth, router, CRUD stores and providers.
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {runInNewContext} from 'node:vm'
import ts from 'typescript'
import {parse, compileTemplate} from '@vue/compiler-sfc'

const require = createRequire(import.meta.url)
const vue = require('vue')
const root = new URL('../src/modules/lifeops/', import.meta.url)
const read = path => readFileSync(new URL(path, root), 'utf8')
const equal = (actual, expected) => assert.equal(JSON.stringify(actual), JSON.stringify(expected))
function evaluate(source, imports, globals = {}) {
  const output = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText
  const exports = {}
  runInNewContext(output, {exports, require: id => {
    assert.ok(id in imports, `Unexpected import: ${id}`)
    return imports[id]
  }, console, setTimeout, clearTimeout, ...globals})
  return exports
}
class EntityCrud {
  get createFields() { return this.fields }
  get updateFields() { return this.fields }
  get viewFields() { return this.fields }
  get deleteFields() { return this.fields }
  getRule(name) { return this.rules[name] }
  getOnInput(name) { return this.onInputs?.[name] }
}
const stores = new Map()
function useCrudStore(name) {
  if (!stores.has(name)) stores.set(name, {form: {}, operation: null, $reset() { this.form = {}; this.operation = null }})
  return stores.get(name)
}
let lookup
const serviceProvider = {findById: async id => lookup(id)}
const calls = []
const transactionProvider = {
  create: async data => { calls.push(['create', data]); return data },
  updatePartial: async (id, data) => { calls.push(['patch', id, data]); return data },
}
const ServiceCrud = evaluate(read('cruds/ServiceCrud.ts'), {
  '@drax/crud-vue': {EntityCrud}, '../providers/ServiceProvider': {default: {instance: serviceProvider}},
  './BusinessPartnerCrud': {default: {instance: {}}},
}).default
const ServiceTransactionCrud = evaluate(read('cruds/ServiceTransactionCrud.ts'), {
  '@drax/crud-vue': {EntityCrud, useCrudStore},
  '../providers/ServiceTransactionProvider': {default: {instance: transactionProvider}},
  './ServiceCrud': {default: ServiceCrud}, '../providers/ServiceProvider': {default: {instance: serviceProvider}},
}).default
const generic = {permissions: {view: 'other:view'}, provider: {paginate: async () => ({items: [], total: 0})}}
const centerImports = Object.fromEntries(['Task', 'TaskSchedule', 'AgentJob', 'Project', 'Goal', 'Contact', 'BusinessPartner', 'Memory'].map(name => [`../../cruds/${name}Crud`, {default: {instance: generic}}]))
const center = evaluate(read('components/command-center/commandCenter.ts'), {
  ...centerImports, '../../cruds/ServiceCrud': {default: ServiceCrud}, '../../cruds/ServiceTransactionCrud': {default: ServiceTransactionCrud},
})
equal(center.centerFilters('serviceTransactions', 'pending'), [{field: 'status', operator: 'eq', value: 'PENDING'}])
equal(center.centerFilters('serviceTransactions', 'paid'), [{field: 'status', operator: 'eq', value: 'PAID'}])
equal(center.centerFilters('services', 'inactive'), [{field: 'active', operator: 'eq', value: false}])
equal(center.centerFilters('services', 'active'), [{field: 'active', operator: 'eq', value: true}])
equal(center.centerFilters('serviceTransactions', 'pending', {field: 'service', id: 's1'}), [
  {field: 'service', operator: 'eq', value: 's1'}, {field: 'status', operator: 'eq', value: 'PENDING'},
])
const entities = center.centerEntities()
equal(entities.find(entity => entity.key === 'projects').columns, ['name', 'priority', 'businessPartner', 'tags'])

const relations = parse(read('components/command-center/CommandCenterRelations.vue')).descriptor.template.content
assert.equal(compileTemplate({source: relations, filename: 'CommandCenterRelations.vue', id: 'test'}).errors.length, 0)
const projectRelation = relations.split('\n').find(line => line.includes("related('projects'"))
const projectCondition = projectRelation.match(/v-if="([^"]+)"/)[1]
assert.equal(runInNewContext(projectCondition, {tab: 'goals', visible: ['projects']}), false)
assert.equal(runInNewContext(projectCondition, {tab: 'businessPartners', visible: ['projects']}), true)
assert.equal(runInNewContext(projectCondition, {tab: 'businessPartners', visible: []}), false)
assert.ok(projectRelation.includes("related('projects', 'businessPartner')"))
assert.ok(!relations.includes('item.goals'))
assert.ok(relations.includes("tab === 'goals' ? 'goals'"))

const removedProjectFields = ['goals', 'priorityScore', 'startDate', 'targetDate', 'completedAt', 'progressPercent']
for (const name of ['Project', 'BusinessPartner']) {
  const imports = {
    '@drax/crud-vue': {EntityCrud},
    '@drax/identity-vue': {UserCrud: {instance: {}}},
    [`../providers/${name}Provider`]: {default: {instance: {}}},
    './BusinessPartnerCrud': {default: {instance: {}}},
    './ContactCrud': {default: {instance: {}}},
  }
  const crud = evaluate(read(`cruds/${name}Crud.ts`), imports).default.instance
  const removed = name === 'Project' ? removedProjectFields : ['redmineProjectIds']
  for (const key of removed) {
    assert.ok(!crud.fields.some(field => field.name === key))
    assert.ok(!crud.headers.some(header => header.key === key))
  }
  for (const field of crud.fields) {
    assert.equal(field.cols, 12)
    assert.ok(field.md >= 1 && field.md <= 12)
    assert.ok(field.lg >= 1 && field.lg <= 12)
  }
  if (name === 'Project') {
    assert.equal(crud.fields.find(field => field.name === 'redmineProjectId').type, 'string')
    assert.ok(!('Goal' in crud.refs))
  }
  const {descriptor} = parse(read(`components/cruds/${name}Crud.vue`))
  assert.equal(compileTemplate({source: descriptor.template.content, filename: `${name}Crud.vue`, id: 'test'}).errors.length, 0)
  for (const header of crud.headers) assert.ok(descriptor.template.content.includes(`#item.${header.key}=`))
  const messages = evaluate(read(`i18n/${name}-i18n.ts`), {}).default
  for (const locale of ['en', 'es']) {
    const labels = messages[locale][name.toLowerCase()].field
    for (const field of crud.fields) assert.ok(labels[field.name], `Missing ${locale} label: ${name}.${field.name}`)
    for (const key of removed) assert.ok(!(key in labels))
  }
}
const serviceEntities = entities.filter(entity => ['services', 'serviceTransactions'].includes(entity.key))
equal(center.centerWorkspaceTabs(serviceEntities).map(({key, tab}) => ({key, tab})), [{key: 'services', tab: 'services'}])
equal(center.centerWorkspaceTabs([serviceEntities[1]]).map(({key, tab}) => ({key, tab})), [{key: 'services', tab: 'serviceTransactions'}])
assert.equal(center.centerWorkspaceTabs(entities).length, 9)
assert.equal(center.centerMetrics.filter(metric => metric.tab === 'serviceTransactions').length, 1)

const granted = new Set(['servicetransaction:manage'])
const requests = []
transactionProvider.paginate = async options => { requests.push(options); return {items: [], total: 37} }
const route = vue.reactive({query: {tab: 'serviceTransactions', preset: 'pending'}})
const createWorkspace = () => evaluate(read('components/command-center/useCommandCenter.ts'), {
  vue: {...vue, onBeforeUnmount: () => {}}, './commandCenter': center,
  '@drax/identity-vue': {useAuth: () => ({hasPermission: permission => granted.has(permission)})},
  'vue-router': {useRoute: () => route, useRouter: () => ({replace: async ({query}) => { route.query = query; await vue.nextTick() }})},
}).useCommandCenter()
const workspace = createWorkspace()
assert.equal(workspace.can('services', 'view'), false)
for (const operation of ['view', 'create', 'update', 'delete']) assert.equal(workspace.can('serviceTransactions', operation), true)
equal(workspace.visibleEntities.value.map(entity => entity.key), ['serviceTransactions'])
await workspace.loadMetrics()
assert.equal(workspace.metrics.find(metric => metric.tab === 'serviceTransactions').total, 37)
equal(requests.at(-1).filters, [{field: 'status', operator: 'eq', value: 'PENDING'}])
workspace.navigate({tab: 'serviceTransactions', context: {field: 'service', id: 's1', label: 'Internet'}})
await vue.nextTick()
assert.equal(workspace.activeTab.value, 'serviceTransactions')
assert.equal(workspace.state.value.context.id, 's1')
workspace.navigate(center.centerMetrics.find(metric => metric.tab === 'serviceTransactions'))
await vue.nextTick()
assert.equal(workspace.state.value.preset, 'pending')
assert.equal(workspace.state.value.context, undefined)
workspace.navigate({tab: 'services'})
assert.equal(workspace.activeTab.value, 'serviceTransactions')
granted.clear()
granted.add('service:view')
assert.equal(workspace.can('services', 'view'), true)
assert.equal(workspace.can('services', 'create'), false)
assert.equal(workspace.can('serviceTransactions', 'view'), false)
granted.add('other:view')
route.query = {tab: 'projects', contextField: 'goals', contextId: 'g1'}
const relationsWorkspace = createWorkspace()
await vue.nextTick()
assert.equal(relationsWorkspace.activeTab.value, 'projects')
assert.equal(relationsWorkspace.state.value.context, undefined)
route.query = {tab: 'projects', contextField: 'businessPartner', contextId: 'bp1'}
await vue.nextTick()
assert.equal(relationsWorkspace.state.value.context.field, 'businessPartner')
route.query = {tab: 'tasks', contextField: 'goals', contextId: 'g1'}
await vue.nextTick()
assert.equal(relationsWorkspace.state.value.context.field, 'goals')

const translations = evaluate(read('i18n/CommandCenter-i18n.ts'), {}).default
for (const language of ['en', 'es']) {
  assert.ok(translations[language].commandCenter.tabs.services)
  assert.ok(translations[language].commandCenter.tabs.serviceTransactions)
  assert.ok(translations[language].commandCenter.metrics.serviceTransactions_pending)
  assert.ok(translations[language].commandCenter.metricHints.serviceTransactions_pending)
}
for (const filename of ['CommandCenterWorkspace.vue', 'CommandCenterMemoryCard.vue']) {
  const {descriptor} = parse(read(`components/command-center/${filename}`))
  assert.equal(compileTemplate({source: descriptor.template.content, filename, id: 'memory-test'}).errors.length, 0)
}
const memoryWorkspaceTemplate = parse(read('components/command-center/CommandCenterWorkspace.vue')).descriptor.template.content
assert.ok(memoryWorkspaceTemplate.includes('<div v-if="entity.key === \'memories\'"'))
assert.ok(memoryWorkspaceTemplate.includes('<v-data-table-server v-else-if="!smAndDown"'))
assert.ok(memoryWorkspaceTemplate.includes('<command-center-memory-card'))
function memoryCard(item, colors = {}) {
  const {descriptor} = parse(read('components/command-center/CommandCenterMemoryCard.vue'))
  return evaluate(`${descriptor.scriptSetup.content}\nexport const result = {accent: accent.value, accentColor: accentColor.value, tags: tags.value}`, {
    vue, 'vue-i18n': {useI18n: () => ({t: key => key})}, './commandCenter': center,
    './CommandCenterCell.vue': {default: {}},
  }, {defineProps: () => ({item, colors}), defineEmits: () => () => {}}).result
}
equal(memoryCard({_id: 'm1', priority: 'High', tags: ['work', '', '  ', null, 'ideas']}, {priority: {High: '#ff9800'}}), {
  accent: '#ff9800', accentColor: '#ff9800', tags: ['work', 'ideas'],
})
equal(memoryCard({_id: 'm2'}), {accent: 'primary', accentColor: 'rgb(var(--v-theme-primary))', tags: []})
for (const language of ['en', 'es']) {
  for (const key of ['sortBy', 'sortAscending', 'sortDescending']) assert.ok(translations[language].commandCenter[key])
  for (const key of ['source', 'createdAt']) assert.ok(translations[language].commandCenter.fields[key])
}
const serviceTranslations = evaluate(read('i18n/Service-i18n.ts'), {}).default
const transactionTranslations = evaluate(read('i18n/ServiceTransaction-i18n.ts'), {}).default
function display(tab, field, value) {
  const {descriptor} = parse(read('components/command-center/CommandCenterCell.vue'))
  const messages = {...serviceTranslations.es, ...transactionTranslations.es}
  const translated = key => key.split('.').reduce((entry, name) => entry?.[name], messages)
  return evaluate(`${descriptor.scriptSetup.content}\nexport const renderedText = text.value`, {
    vue, './commandCenter': center,
    'vue-i18n': {useI18n: () => ({t: translated, te: key => typeof translated(key) === 'string', locale: vue.ref('es-AR')})},
  }, {defineProps: () => ({tab, field, value})}).renderedText
}
assert.equal(display('services', 'type', 'INCOME'), 'Ingreso')
assert.equal(display('services', 'frequency', 'ON_DEMAND'), 'Bajo demanda')
assert.equal(display('serviceTransactions', 'status', 'PENDING'), 'Pendiente')
assert.equal(display('serviceTransactions', 'service', {_id: 's1', name: 'Internet'}), 'Internet')
assert.equal(display('serviceTransactions', 'amount', 125.5), new Intl.NumberFormat('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(125.5))
assert.equal(display('serviceTransactions', 'paidAt', null), '—')
assert.notEqual(display('serviceTransactions', 'paidAt', '2026-01-15T15:00:00Z'), '—')

function dialog(operation, item) {
  const {descriptor} = parse(read('components/command-center/CommandCenterDialog.vue'))
  assert.equal(compileTemplate({source: descriptor.template.content, filename: 'CommandCenterDialog.vue', id: 'test'}).errors.length, 0)
  let entity
  evaluate(descriptor.scriptSetup.content, new Proxy({
    vue, vuetify: {useDisplay: () => ({smAndDown: false})}, 'vue-i18n': {useI18n: () => ({t: key => key, te: () => false})},
    '@drax/crud-vue': {useCrudStore, useCrud: value => {
      entity = value
      const store = useCrudStore(value.name)
      return Object.fromEntries(['Create', 'Edit', 'Delete', 'View'].map(action => [`on${action}`, record => {
        store.operation = action === 'Edit' ? 'edit' : action.toLowerCase()
        store.form = record ? {...record} : Object.fromEntries(value.createFields.map(field => [field.name, field.default]))
      }]))
    }},
    '../../cruds/ServiceTransactionCrud': {default: ServiceTransactionCrud}, './commandCenter': center,
  }, {has: () => true, get: (target, key) => target[key] ?? {default: {}}}), {
    defineProps: () => ({entity: serviceEntities[1], operation, item, visible: ['serviceTransactions']}), defineEmits: () => () => {},
  })
  return {entity, store: useCrudStore(entity.name)}
}
const created = dialog('create')
assert.ok(!created.entity.createFields.some(field => field.name === 'paidAt'))
assert.ok(created.entity.viewFields.some(field => field.name === 'paidAt'))
created.store.form.service = 's1'
lookup = async () => ({amount: 125.5})
await created.entity.getOnInput('service')('s1')
assert.equal(created.store.form.amount, 125.5)
created.store.form.amount = 0
await created.entity.getOnInput('service')('s1')
assert.equal(created.store.form.amount, 0)
created.store.form.amount = null
let finish
lookup = () => new Promise(resolve => { finish = resolve })
const pendingLookup = created.entity.getOnInput('service')('s1')
created.store.form.service = 's2'
finish({amount: 999})
await pendingLookup
assert.equal(created.store.form.amount, null)
await created.entity.provider.create({service: {_id: 's1', name: 'Internet'}, period: '2026-01', amount: 125.5, status: 'PENDING', paidAt: 'injected'})
equal(calls.at(-1), ['create', {service: 's1', period: '2026-01', amount: 125.5, status: 'PENDING'}])
const original = {_id: 't1', service: {_id: 's1', name: 'Internet'}, period: '2025-01', amount: 125.5, status: 'PENDING', paidAt: null}
const edited = dialog('edit', original)
await edited.entity.provider.update('t1', {...original, service: 's1', status: 'PAID', paidAt: 'injected'})
equal(calls.at(-1), ['patch', 't1', {status: 'PAID'}])
await edited.entity.provider.update('t1', {...original, status: 'PENDING', amount: 0})
equal(calls.at(-1), ['patch', 't1', {amount: 0}])
assert.equal(edited.entity.getRule('period')[0]('2026-13'), 'servicetransaction.validation.period')
assert.equal(edited.entity.getRule('period')[0]('2026-01'), true)
assert.equal(edited.entity.getRule('amount')[0](-1), 'servicetransaction.validation.amount')
for (const operation of ['view', 'delete']) assert.equal(dialog(operation, original).store.operation, operation)
console.log('Command Center assertions passed: grouping, permissions, all-period metrics, navigation, CRUD setup, validation, amount defaults/races, populated refs and paidAt exclusion.')
