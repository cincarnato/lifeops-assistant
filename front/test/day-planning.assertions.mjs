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
assert.deepEqual(Object.keys(calls.at(-1).data), [], 'Status is derived; PATCH must not inject missing collections')
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
function loadModule(path) {
  const exports = {}
  runInNewContext(ts.transpileModule(read(path), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}
  }).outputText, {exports})
  return exports
}
const {assignTask, prioritySlots} = loadModule('components/taskPlanning.ts')
assert.equal(prioritySlots.join(','), 'A1,A2,A3')
const tasks = [{task: 'one', priority: 'A1', decision: 'COMPROMETIDO'}, {task: 'two', priority: null, decision: 'PENDIENTE'}]
assignTask(tasks, tasks[1], 'A1')
assert.equal(tasks[0].priority, null)
assert.equal(tasks[0].decision, 'PENDIENTE', 'Replacement returns previous task to proposals')
assert.equal(tasks[1].priority, 'A1')
assert.equal(tasks[1].decision, 'COMPROMETIDO')
assignTask(tasks, tasks[1], 'DESEABLE')
assert.equal(tasks[1].priority, null)
assert.equal(tasks[1].decision, 'DESEABLE')
assignTask(tasks, tasks[1], 'A2')
assignTask(tasks, tasks[1], null)
assert.equal(tasks[1].priority, null)
assert.equal(tasks[1].decision, 'PENDIENTE', 'Removing returns task to proposals')
assert.equal(tasks.length, 2, 'Assignments never remove real tasks')
const board = read('components/TaskPlanningBoard.vue')
assert.doesNotMatch(board, /v-select|Combobox|bg-error/)
assert.match(board, /v-for="slot in slots"/)
assert.match(board, /:disabled="readonly"/)
assert.match(component, /TaskPlanningBoard/)
assert.doesNotMatch(component, /performance|totalItems|item.status/)
for (const mode of ['more', 'other']) {
  await provider.proposals('plan', mode)
  assert.equal(calls.at(-1).method, 'post')
  assert.equal(calls.at(-1).args[0], '/api/day-plans/plan/proposals')
  assert.equal(calls.at(-1).args[1].mode, mode)
}
const {serialQueue, persistLatest} = loadModule('components/planningPersistence.ts')
const queue = serialQueue()
const order = []
let release
const firstWrite = queue(async () => { order.push('save'); await new Promise(resolve => { release = resolve }); order.push('saved') })
const transition = queue(async () => { order.push('calendar') })
await Promise.resolve()
assert.deepEqual(order, ['save'])
release()
await Promise.all([firstWrite, transition])
assert.deepEqual(order, ['save', 'saved', 'calendar'])
await assert.rejects(queue(async () => { throw new Error('offline') }), /offline/)
await queue(async () => { order.push('retry') })
assert.equal(order.at(-1), 'retry', 'A failed request must not poison the queue')
let draft = {value: 1}
let saved = JSON.stringify({value: 0})
let writes = 0
const persist = write => persistLatest(() => draft, () => saved, write, (sent, response) => {
  saved = response ? JSON.stringify(response) : sent
  if (response) draft = response
})
await persist(async value => {
  writes++
  if (writes === 1) draft = {value: 2}
  return value
})
assert.equal(writes, 2)
assert.equal(draft.value, 2, 'Old responses cannot overwrite newer edits')
assert.equal(saved, JSON.stringify(draft))
draft = {value: 3}
await assert.rejects(persist(async () => { throw new Error('offline') }), /offline/)
assert.equal(draft.value, 3, 'Failed save retains local edits')
assert.equal(saved, JSON.stringify({value: 2}))
await persist(async value => value)
assert.equal(saved, JSON.stringify({value: 3}), 'Retry persists retained edits')
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
const messages = loadModule('i18n/DayPlan-i18n.ts').default
for (const key of ['priorityProgress', 'emptyPriority', 'removeAssignment', 'proposals', 'noProposals', 'desirables', 'noDesirables', 'moreProposals', 'otherProposals', 'retry', 'saving', 'saved', 'unsaved']) {
  for (const language of ['es', 'en']) assert.ok(messages[language].dayplan.ui[key], `${language}: ${key}`)
}
assert.doesNotMatch(page, /plan.status|discardAllowed|@click="cancel"/)
assert.match(page, /onBeforeRouteLeave\(\(\) => run/)
const runnerSource = page.slice(page.indexOf('const enqueue ='), page.indexOf('function retry()'))
const runner = {
  serialQueue, persistLatest, plan: {value: {_id: 'plan', value: 1}}, snapshot: {value: JSON.stringify({_id: 'plan', value: 0})},
  busy: {value: false}, error: {value: ''}, Error, t: key => key,
  provider: {update: async () => { throw new Error('offline') }}
}
runner.accept = value => { runner.plan.value = value; runner.snapshot.value = JSON.stringify(value) }
runInNewContext(ts.transpileModule(runnerSource, {compilerOptions: {target: ts.ScriptTarget.ES2022}}).outputText, runner)
let transitioned = false
assert.equal(await runner.run(async () => { transitioned = true }), false)
assert.equal(transitioned, false, 'Failed saves block calendar, reload and navigation actions')
assert.equal(runner.error.value, 'offline')
assert.equal(runner.plan.value.value, 1)
runner.provider.update = async (_, value) => value
assert.equal(await runner.run(async () => { transitioned = true }), true)
assert.equal(transitioned, true)
assert.equal(runner.error.value, '')
assert.equal(runner.busy.value, false)
const loaderSource = page.slice(page.indexOf('async function loadSlots()'), page.indexOf('watch([reservationDate'))
const pending = []
const loader = {
  startAt: {value: null}, slots: {value: []}, slotsBusy: {value: false},
  scheduleOpen: {value: true}, reservationDate: {value: '2026-10-19'}, slotsError: {value: ''},
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
assert.equal(loader.slotsError.value, '', 'Closed requests must not display stale errors')
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
console.log('Day planning assertions passed (proposals, priorities, serialization, queue, retries, stale responses, offsets and dates).')

assert.match(board, /task.decision !== 'DESCARTADO'/)
assert.match(board, /entry.decision = 'DESCARTADO'/)
assert.match(board, /emit\('schedule', slot.entry.task/)
assert.match(page, /taskId.value = selectedTaskId \|\| null/)
assert.match(page, /capacity.value = null/)
assert.match(page, /result.slots.length/)
assert.match(page, /entry.task.status\?\.completesTask/)
for (const key of ['reserveHour', 'notToday', 'restoreTask', 'hiddenTasks', 'previousPending', 'capacity', 'capacityHint', 'taskFacts']) {
  for (const language of ['es', 'en']) assert.ok(messages[language].dayplan.ui[key])
}
