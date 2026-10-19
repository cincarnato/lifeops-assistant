import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {runInNewContext} from 'node:vm'
import ts from 'typescript'

const root = new URL('../src/modules/lifeops/', import.meta.url)
const read = path => readFileSync(new URL(path, root), 'utf8')
const calls = []
class AbstractCrudRestProvider {
  constructor(basePath) {
    this.basePath = basePath
    this.httpClient = Object.fromEntries(['get', 'post'].map(method => [method, async (...args) => {
      calls.push({method, args})
      return method === 'get' ? null : {_id: 'plan'}
    }]))
  }
  async update(id, data) { calls.push({method: 'update', id, data}); return data }
  async updatePartial(id, data) { calls.push({method: 'patch', id, data}); return data }
  async create(data) { calls.push({method: 'create', data}); return data }
}
const exports = {}
runInNewContext(ts.transpileModule(read('providers/DayPlanProvider.ts'), {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}
}).outputText, {exports, require: () => ({AbstractCrudRestProvider})})
const provider = exports.default.instance
const input = {date: '2026-10-18', status: 'BORRADOR', user: {_id: 'user'}, tasks: [
  {task: {_id: 'task1', title: 'Important', project: {_id: 'project', name: 'Project'}}, decision: 'COMPROMETIDO', priority: 'A1'},
  {task: 'task2', decision: 'DESEABLE', priority: null}
], habits: [{habit: {_id: 'habit'}, decision: 'DESEABLE'}], suggestions: [{title: 'Suggestion', goal: {_id: 'goal'}, project: {_id: 'project'}}]}
const snapshot = JSON.stringify(input)
for (const method of ['create', 'update', 'updatePartial']) {
  if (method === 'create') await provider.create(input)
  else await provider[method]('plan', input)
  const {data} = calls.at(-1)
  assert.equal(data.tasks[0].task, 'task1')
  assert.equal(data.tasks[0].priority, 'A1')
  assert.equal(data.tasks[1].priority, null)
  assert.equal(data.habits[0].habit, 'habit')
  assert.equal(data.suggestions[0].goal, 'goal')
  assert.equal(JSON.stringify(input), snapshot, 'Serialization must not mutate hydrated references')
}
await provider.updatePartial('plan', {status: 'VISTO'})
assert.deepEqual(Object.keys(calls.at(-1).data), ['status'], 'PATCH must not inject missing collections')
assert.equal(await provider.planning('2026-10-18'), null)
assert.equal(calls.at(-1).args[0], '/api/day-plans/planning')
assert.equal(calls.at(-1).args[1].params.date, '2026-10-18')
await provider.generate('2026-10-18')
assert.equal(calls.at(-1).args[0], '/api/day-plans/generate')
assert.equal(calls.at(-1).args[1].date, '2026-10-18')
await provider.availableSlots('2026-10-19')
assert.equal(calls.at(-1).args[1].params.date, '2026-10-19')
await provider.scheduleTask('plan', 'task1', '2026-10-19T15:00:00Z')
assert.equal(calls.at(-1).args[0], '/api/day-plans/plan/schedule-task')
assert.equal(calls.at(-1).args[1].startAt, '2026-10-19T15:00:00Z')
const component = read('components/DayPlan.vue')
assert.doesNotMatch(component, /\.updatePartial\(|\.update\(/, 'Editing the component must not autosave')
const priorityFunctions = component.slice(component.indexOf('function setDecision('), component.indexOf('watch(() => props.item'))
const tasks = [{priority: 'A1', decision: 'COMPROMETIDO'}, {priority: null, decision: 'DESEABLE'}]
const context = {props: {item: {tasks}}, isDecisionReadonly: {value: false}, isDecision: () => true}
runInNewContext(ts.transpileModule(priorityFunctions, {}).outputText + '\nsetPriority(props.item.tasks[1], "A1")', context)
assert.equal(tasks[0].priority, null)
assert.equal(tasks[1].priority, 'A1')
assert.equal(tasks[1].decision, 'COMPROMETIDO')
runInNewContext('setDecision(props.item.tasks[1], "DESEABLE")', context)
assert.equal(tasks[1].priority, null)
context.isDecisionReadonly.value = true
runInNewContext('setPriority(props.item.tasks[1], "A2")', context)
assert.equal(tasks[1].priority, null)
assert.doesNotMatch(read('components/cruds/DayPlanCrud.vue'), /#form|v-slot:form/, 'Keep native save/cancel actions')
// Exercise offsets in both hemispheres and across daylight-saving seasons.
const originalTimezone = process.env.TZ
try {
  for (const timezone of ['America/Argentina/Buenos_Aires', 'America/New_York', 'Pacific/Auckland']) {
    process.env.TZ = timezone
    for (const date of ['2026-01-19', '2026-07-19']) {
      await provider.availableSlots(date)
      assert.equal(calls.at(-1).args[1].params.utcOffsetMinutes, new Date(`${date}T12:00:00`).getTimezoneOffset())
      const startAt = `${date}T02:30:00Z`
      await provider.scheduleTask('plan', 'task1', startAt)
      assert.equal(calls.at(-1).args[1].utcOffsetMinutes, new Date(startAt).getTimezoneOffset())
    }
    const headerSource = component.slice(component.indexOf('function formatDate('), component.indexOf('function formatTime('))
    const crudSource = read('components/cruds/DayPlanCrud.vue')
    const tableSource = crudSource.slice(crudSource.indexOf('function civilDate('), crudSource.indexOf('const {operation}'))
    for (const source of [headerSource, tableSource]) {
      const ctx = {locale: {value: 'en-US'}, Date, Intl}
      runInNewContext(ts.transpileModule(source, {}).outputText, ctx)
      for (const value of ['2026-10-19', '2026-10-19T00:00:00Z', new Date('2026-10-19T00:00:00Z')]) {
        assert.match(ctx.formatDate(value), /19/, `${timezone}: date must remain the 19th`)
      }
      assert.equal(ctx.formatDate('invalid'), '-')
    }
  }
} finally {
  if (originalTimezone === undefined) delete process.env.TZ
  else process.env.TZ = originalTimezone
}

const page = read('pages/DayPlanningPage.vue')
const loaderSource = page.slice(page.indexOf('async function loadSlots()'), page.indexOf('watch([reservationDate'))
const pending = []
const loader = {
  startAt: {value: null}, slots: {value: []}, slotsBusy: {value: false},
  scheduleOpen: {value: true}, reservationDate: {value: '2026-10-19'}, error: {value: ''},
  provider: {availableSlots: () => new Promise((resolve, reject) => pending.push({resolve, reject}))},
  t: key => key, Error
}
runInNewContext('let slotRequest = 0;\n' + ts.transpileModule(loaderSource, {}).outputText, loader)
const first = loader.loadSlots()
assert.equal(loader.slotsBusy.value, true)
loader.scheduleOpen.value = false
await loader.loadSlots()
assert.equal(loader.slotsBusy.value, false, 'Closing the dialog clears loading immediately')
pending[0].reject(new Error('Stale failure'))
await first
assert.equal(loader.error.value, '', 'Closed requests must not display stale errors')
loader.scheduleOpen.value = true
const second = loader.loadSlots()
loader.reservationDate.value = '2026-10-20'
const third = loader.loadSlots()
pending[1].resolve({slots: [{startAt: 'stale'}]})
await second
assert.equal(loader.slotsBusy.value, true, 'Old response must not clear current loading')
assert.equal(loader.slots.value.length, 0)
pending[2].resolve({slots: [{startAt: 'current'}]})
await third
assert.equal(loader.slots.value[0].startAt, 'current')
assert.equal(loader.slotsBusy.value, false)
loader.reservationDate.value = ''
await loader.loadSlots()
assert.equal(loader.slotsBusy.value, false)
assert.equal(loader.slots.value.length, 0)
console.log('Day planning assertions passed (serialization, priorities, offsets, UTC civil dates and slot request races).')
