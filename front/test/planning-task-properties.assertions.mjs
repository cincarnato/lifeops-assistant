import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {runInNewContext} from 'node:vm'
import ts from 'typescript'
import {ref, watch, effectScope, nextTick} from 'vue'
import {parse, compileScript, compileTemplate} from '@vue/compiler-sfc'

const root = new URL('../src/modules/lifeops/', import.meta.url)
const read = path => readFileSync(new URL(path, root), 'utf8')
const exports = {}
let stored = null
const storage = {getItem: () => stored, setItem: (_, value) => { stored = value }}
runInNewContext(ts.transpileModule(read('composables/usePlanningTaskProperties.ts'), {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}
}).outputText, {exports, require: () => ({ref, watch}), Date, Intl, localStorage: storage})
const {planningTaskProperties: catalog, DEFAULT_PLANNING_TASK_PROPERTIES: defaults,
  normalizePlanningTaskProperties: normalize, parsePlanningTaskProperties: parseSelection,
  loadPlanningTaskProperties: load, savePlanningTaskProperties: save,
  formatPlanningTaskProperty: format, usePlanningTaskProperties: useProperties} = exports
const plain = value => JSON.parse(JSON.stringify(value))
assert.equal(catalog.length, 26)
assert.equal(new Set(catalog.map(item => item.key)).size, 26)
assert.deepEqual(plain(defaults), ['importance', 'urgent', 'dueDate', 'project'])
for (const value of [null, '{', '{}', 'false', '"project"']) {
  assert.deepEqual(plain(parseSelection(value)), plain(defaults))
}
assert.deepEqual(plain(parseSelection('[]')), [])
assert.deepEqual(plain(normalize(['project', 'unknown', 'project', null, 2, 'urgent'])), ['project', 'urgent'])
const broken = {getItem() { throw Error('blocked') }, setItem() { throw Error('quota') }}
assert.deepEqual(plain(load(broken)), plain(defaults))
assert.equal(save(broken, []), false)
assert.equal(save(storage, []), true)
assert.equal(stored, '[]')
const scope = effectScope()
let first, second
scope.run(() => { first = useProperties(); second = useProperties() })
assert.deepEqual(plain(first.visibleProperties.value), [])
first.visibleProperties.value = ['project']
await nextTick()
assert.equal(stored, '["project"]')
assert.deepEqual(plain(second.visibleProperties.value), [], 'Instances must not share state')
first.visibleProperties.value.push('urgent')
await nextTick()
assert.equal(stored, '["project","urgent"]')
scope.stop()
const options = {locale: 'en-US', t: (key, values) => values ? `${values.count} items` : key,
  importanceTitle: value => value === 'HIGH' ? 'A - High' : undefined}
for (const task of [null, undefined, 'id', 0, {}]) assert.equal(format(task, 'project', options), '')
assert.equal(format({status: {name: 'Ready'}}, 'status', options), 'Ready')
assert.equal(format({project: {title: 'Project'}}, 'project', options), 'Project')
assert.equal(format({user: {givenName: 'Ada', familyName: 'Lovelace'}}, 'user', options), 'Ada Lovelace')
assert.equal(format({goals: ['One', {name: 'Two'}, null]}, 'goals', options), 'One, Two')
assert.equal(format({description: ' text '}, 'description', options), 'text')
assert.equal(format({importance: 'HIGH'}, 'importance', options), 'A - High')
for (const key of ['valueScore', 'motivationScore', 'effortScore']) {
  assert.equal(format({[key]: 0}, key, options), '0')
  assert.equal(format({[key]: NaN}, key, options), '')
  assert.equal(format({[key]: 2.7}, key, options), '3')
}
assert.equal(format({urgent: false}, 'urgent', options), 'dayplan.ui.propertyNo')
assert.equal(format({urgent: true}, 'urgent', options), 'dayplan.ui.propertyYes')
assert.equal(format({notes: [{note: 'private'}, {note: ''}, null]}, 'notes', options), '1 items')
assert.equal(format({notes: 'private'}, 'notes', options), '1 items')
assert.equal(format({notes: []}, 'notes', options), '')
assert.equal(format({statusHistory: [{status: 'secret'}, {}]}, 'statusHistory', options), '2 items')
assert.equal(format({dueDate: 'invalid'}, 'dueDate', options), '')
const timezone = process.env.TZ
try {
  for (const zone of ['America/Argentina/Buenos_Aires', 'Pacific/Auckland', 'America/New_York']) {
    process.env.TZ = zone
    for (const key of ['dueDate', 'scheduledDate']) {
      for (const value of ['2026-10-19', '2026-10-19T00:00:00Z', new Date('2026-10-19T00:00:00Z')]) {
        assert.equal(format({[key]: value}, key, options), '10/19/2026')
      }
      assert.equal(format({[key]: '2026-10-19'}, key, {...options, locale: 'es-AR'}), '19/10/2026')
    }
  }
} finally {
  if (timezone === undefined) delete process.env.TZ
  else process.env.TZ = timezone
}
for (const name of ['PlanningTaskProperties', 'PlanningTaskPropertySelector']) {
  const source = read(`components/${name}.vue`)
  const {descriptor, errors} = parse(source)
  assert.deepEqual(errors, [])
  const script = compileScript(descriptor, {id: name})
  const template = compileTemplate({source: descriptor.template.content, filename: `${name}.vue`, id: name,
    compilerOptions: {bindingMetadata: script.bindings}})
  assert.deepEqual(template.errors, [])
}
function messages(path) {
  const exports = {}
  runInNewContext(ts.transpileModule(read(path), {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText, {exports})
  return exports.default
}
const taskMessages = messages('i18n/Task-i18n.ts')
const planMessages = messages('i18n/DayPlan-i18n.ts')
for (const language of ['en', 'es']) {
  for (const property of catalog) {
    assert.ok(taskMessages[language].task.field[property.key], `${language}: label for ${property.key}`)
    assert.ok(planMessages[language].dayplan.ui.propertyGroups[property.group], `${language}: group ${property.group}`)
  }
}
const display = read('components/PlanningTaskProperties.vue')
assert.match(display, /tabindex="0"/)
assert.match(display, /:aria-label="property.tooltip"/)
assert.match(display, /text-truncate/)
console.log('Planning task properties assertions passed (catalog, persistence, instance isolation, formatting, UTC dates and SFC compilation).')
