import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {runInNewContext} from 'node:vm'
import ts from 'typescript'

function evaluate(path, imports) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace('import.meta.env.BASE_URL', "'/'")
  const output = ts.transpileModule(source, {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
  }).outputText
  const exports = {}
  runInNewContext(output, {exports, require: id => {
    assert.ok(id in imports, `Unexpected import: ${id}`)
    return imports[id]
  }, console: {...console, log: () => {}}})
  return exports
}

let guard
let authenticated = false
let enabled = true
let permitted = false
let refresh = async () => {}
const store = {refreshToken: null}
evaluate('../src/router/index-routes.ts', {
  'vue-router': {
    createWebHistory: () => ({}),
    createRouter: () => ({beforeEach: callback => { guard = callback }}),
  },
  'virtual:generated-layouts': {setupLayouts: routes => routes},
  './drax-routes': {default: []},
  './modules-routes': {default: []},
  '@drax/identity-vue': {
    refreshAuthSession: () => refresh(),
    isRememberMeEnabled: () => enabled,
    useAuthStore: () => store,
    useAuth: () => ({isAuthenticated: () => authenticated, hasPermission: () => permitted}),
  },
})
const protectedRoute = {name: 'Tasks', fullPath: '/tasks?view=today', meta: {auth: true}}
const permissionRoute = {...protectedRoute, meta: {permission: 'task:manage'}}
const redirected = result => {
  assert.equal(result.path, '/login')
  assert.equal(result.query.redirect, protectedRoute.fullPath)
}

// Normal login/disabled feature: stale refresh credentials must not trap navigation.
redirected(await guard(protectedRoute))
store.refreshToken = 'fixture-session'
enabled = false
redirected(await guard(protectedRoute))

// Await renewal before authentication and permission checks.
enabled = true
let finishRefresh
refresh = () => new Promise(resolve => { finishRefresh = resolve })
let settled = false
const navigation = guard(protectedRoute).then(result => { settled = true; return result })
await Promise.resolve()
assert.equal(settled, false)
authenticated = true
finishRefresh()
assert.equal(await navigation, undefined)

// Offline refresh or missing profile: cancel protected routes, preserve credentials.
refresh = async () => { throw new Error('Offline fixture') }
authenticated = false
assert.equal(await guard(protectedRoute), false)
assert.equal(await guard(permissionRoute), false)
assert.equal(store.refreshToken, 'fixture-session')
assert.equal(await guard({name: 'Login', fullPath: '/login', meta: {}}), undefined)
assert.equal(await guard({name: 'Public', fullPath: '/public', meta: {}}), undefined)

// Credential rejection is cleared by the framework; normal redirect must follow.
refresh = async () => { store.refreshToken = null; throw new Error('Rejected fixture') }
redirected(await guard(protectedRoute))

// Remembered credentials never bypass permissions for an authenticated user.
refresh = async () => {}
authenticated = true
store.refreshToken = 'fixture-session'
redirected(await guard(permissionRoute))
permitted = true
assert.equal(await guard(permissionRoute), undefined)

// Bootstrap must wait for session setup before settings, entities, router and mount.
const events = []
let finishSetup
const sessionSetup = new Promise(resolve => { finishSetup = resolve })
const {setupAuth} = evaluate('../src/setup/SetupAuth.ts', {
  '@drax/identity-vue': {setupAuthSession: () => { events.push('auth'); return sessionSetup }},
})
const app = {
  use: plugin => { events.push(plugin); return app },
  mount: () => { events.push('mount') },
}
evaluate('../src/main.ts', {
  './App.vue': {default: {}},
  '@/i18n/index-I18n': {default: 'i18n'},
  '@/plugins/vuetify': {default: 'vuetify'},
  '@/router/index-routes': {default: 'router'},
  '@/stores': {default: 'pinia'},
  vue: {createApp: () => app},
  './setup/SetupAuth': {setupAuth},
  './setup/SetupSetting': {default: async () => { events.push('settings') }},
  './setup/SetupEntities': {default: () => { events.push('entities') }},
})
assert.deepEqual(events, ['pinia', 'auth'])
finishSetup()
await new Promise(resolve => setImmediate(resolve))
assert.deepEqual(events, ['pinia', 'auth', 'settings', 'entities', 'vuetify', 'router', 'i18n', 'mount'])
console.log('Auth session guard and bootstrap assertions passed.')
