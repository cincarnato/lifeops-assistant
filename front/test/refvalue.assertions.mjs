import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {runInNewContext} from 'node:vm'
import ts from 'typescript'

const root = new URL('../src/modules/lifeops/', import.meta.url)
const catalogs = Object.fromEntries(['Priority', 'Source', 'LifeArea', 'TaskType', 'MemoryType'].map(name => [name, {name}]))
const expected = {
  Task: {priority: 'Priority', source: 'Source', lifeArea: 'LifeArea', type: 'TaskType'},
  Memory: {priority: 'Priority', source: 'Source', lifeArea: 'LifeArea', type: 'MemoryType'},
  Project: {priority: 'Priority'},
  Goal: {priority: 'Priority', lifeArea: 'LifeArea'}
}

for (const [name, fields] of Object.entries(expected)) {
  const source = readFileSync(new URL(`cruds/${name}Crud.ts`, root), 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}
  }).outputText
  const exports = {}
  runInNewContext(output, {
    exports,
    require: id => {
      if (id === '@drax/crud-vue') return {EntityCrud: class {}, useCrudStore: () => ({})}
      if (id === '@drax/identity-vue') return {UserCrud: {instance: {}}}
      const catalog = Object.keys(catalogs).find(name => id === `./${name}Crud`)
      if (catalog) return {default: {instance: catalogs[catalog]}}
      assert.match(id, /^(\.\/\w+Crud|\.\.\/providers\/\w+Provider)$/)
      return {default: {instance: {}}}
    }
  })
  const crud = exports.default.instance
  for (const [fieldName, catalog] of Object.entries(fields)) {
    const field = crud.fields.find(field => field.name === fieldName)
    assert.ok(field, `${name}.${fieldName} exists`)
    assert.equal(field.type, 'refvalue', `${name}.${fieldName} renders a catalog selector`)
    assert.equal(field.ref, catalog)
    assert.equal(field.refDisplay, 'name')
    assert.equal(field.refValue, 'name', `${name}.${fieldName} stores names, not IDs`)
    assert.equal(crud.refs[field.ref], catalogs[catalog], `${name}.${fieldName} resolves its catalog CRUD`)
    assert.equal(field.default, ['Task', 'Memory'].includes(name) ? null : '')
  }
}
console.log('Catalog refvalue assertions passed (11 fields across 4 CRUDs).')
