import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {runInNewContext} from 'node:vm'
import ts from 'typescript'

const root = new URL('../src/modules/lifeops/', import.meta.url)
const read = path => readFileSync(new URL(path, root), 'utf8')
const equal = (actual, expected) => assert.equal(JSON.stringify(actual), JSON.stringify(expected))
const errors = []
function evaluate(source, imports) {
  const output = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText
  const exports = {}
  runInNewContext(output, {exports, require: id => {
    assert.ok(id in imports, `Unexpected import: ${id}`)
    return imports[id]
  }, console: {...console, error: (...args) => errors.push(args)}})
  return exports
}
class EntityCrud {
  getOnInput(name) { return this.onInputs?.[name] }
}
const stores = new Map()
function useCrudStore(name) {
  if (!stores.has(name)) stores.set(name, {form: {}, operation: null})
  return stores.get(name)
}
let projectLookup
const TaskCrud = evaluate(read('cruds/TaskCrud.ts'), {
  '@drax/crud-vue': {EntityCrud, useCrudStore},
  '@drax/identity-vue': {UserCrud: {instance: {}}},
  '../providers/TaskProvider': {default: {instance: {}}},
  '../providers/ProjectProvider': {default: {instance: {findById: async id => projectLookup(id)}}},
  './GoalCrud': {default: {instance: {}}}, './ProjectCrud': {default: {instance: {}}},
}).default
const taskStore = useCrudStore('Task')
const taskCrud = TaskCrud.instance
taskStore.operation = 'create'
taskStore.form = {project: 'p1', goals: []}
projectLookup = async () => ({goals: [{_id: 'g1', name: 'Goal'}, {_id: 'g2', name: 'Other goal'}]})
await taskCrud.getOnInput('project')('p1')
equal(taskStore.form.goals, ['g1', 'g2'])
taskStore.operation = 'edit'
taskStore.form.project = 'p2'
projectLookup = async () => ({goals: ['g3']})
await taskCrud.getOnInput('project')('p2')
equal(taskStore.form.goals, ['g3'])
projectLookup = async () => ({})
await taskCrud.getOnInput('project')('p2')
equal(taskStore.form.goals, [])
taskStore.form.goals = ['manual-goal']
await taskCrud.getOnInput('project')(null)
equal(taskStore.form.goals, ['manual-goal'])
for (const operation of ['view', 'delete']) {
  taskStore.operation = operation
  projectLookup = () => { throw new Error('Readonly operation must not fetch a project') }
  await taskCrud.getOnInput('project')('p2')
  equal(taskStore.form.goals, ['manual-goal'])
}
taskStore.operation = 'edit'
let resolveProject
projectLookup = () => new Promise(resolve => { resolveProject = resolve })
const staleProject = taskCrud.getOnInput('project')('p2')
taskStore.form.project = 'p3'
resolveProject({goals: ['stale-goal']})
await staleProject
equal(taskStore.form.goals, ['manual-goal'])
const changedGoals = taskCrud.getOnInput('project')('p3')
taskStore.form.goals = ['edited-goal']
resolveProject({goals: ['stale-goal']})
await changedGoals
equal(taskStore.form.goals, ['edited-goal'])
const closedForm = taskCrud.getOnInput('project')('p3')
taskStore.form = {project: 'p3', goals: []}
resolveProject({goals: ['stale-goal']})
await closedForm
equal(taskStore.form.goals, [])
const centerTaskStore = useCrudStore('CommandCenterTask')
centerTaskStore.operation = 'create'
centerTaskStore.form = {project: 'p4', goals: []}
projectLookup = async () => ({goals: [{_id: 'g4', name: 'Center goal'}]})
await taskCrud.onInputsForStore(centerTaskStore).project('p4')
equal(centerTaskStore.form.goals, ['g4'])
equal(taskStore.form.goals, [])

projectLookup = async () => { throw new Error('Unavailable project') }
await taskCrud.onInputsForStore(centerTaskStore).project('p4')
equal(centerTaskStore.form.goals, ['g4'])
assert.equal(errors.length, 1)
console.log('Project goal inheritance assertions passed.')
