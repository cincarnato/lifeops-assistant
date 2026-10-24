import assert from 'node:assert/strict'
import {readFileSync, existsSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {runInNewContext} from 'node:vm'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const root = fileURLToPath(new URL('../', import.meta.url))
const vue = require('vue')
const pinia = require('pinia')
const component = readFileSync(resolve(root, 'src/modules/google/components/GoogleLogin.vue'), 'utf8')
const script = component.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
const deferred = () => {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return {promise, resolve}
}
const jwt = expiration => [
  Buffer.from(JSON.stringify({alg: 'HS256'})).toString('base64url'),
  Buffer.from(JSON.stringify({exp: expiration})).toString('base64url'), 'fixture',
].join('.')
const session = () => ({
  accessToken: jwt(Date.now() / 1000 + 3600),
  refreshToken: 'fixture-refresh', refreshExpiresAt: '2099-01-01T00:00:00.000Z',
})

// Exercise the installed Drax workflow/store/provider/client; only network and browser context are simulated.
function harness(enabled = true) {
  pinia.setActivePinia(pinia.createPinia())
  const modules = new Map()
  const imports = {pinia, vue: {...vue, onMounted: () => {}}}
  const storage = new Map()
  const requests = []
  const events = []
  let network = async url => url === '/api/auth/me' ? {id: 'google-user', role: {permissions: []}} : session()
  const globals = {
    console: {log() {}, error() {}}, setTimeout, clearTimeout, AbortController, FormData, URLSearchParams,
    atob, crypto: globalThis.crypto, window: {}, testRememberMeEnabled: enabled ? 'true' : 'false',
    localStorage: {getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value)},
    defineEmits: () => event => events.push(event),
    fetch: async (url, options) => {
      const request = {url, ...options, body: options.body ? JSON.parse(options.body) : undefined}
      requests.push(request)
      const body = await network(url, request)
      return {ok: true, json: async () => body}
    },
  }
  function evaluate(source, filename) {
    const output = ts.transpileModule(source.replace(/import\.meta\.env\.VITE_DRAX_REMEMBER_ME_ENABLED/g, 'testRememberMeEnabled')
      .replace(/import\.meta\.env\.VITE_GOOGLE_CLIENT_ID/g, "'fixture-client'"), {
      compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
    }).outputText
    const exports = {}
    runInNewContext(output, {...globals, exports, require: id => {
      if (id in imports) return imports[id]
      if (id.startsWith('.')) return load(resolve(dirname(filename), id))
      throw new Error(`Unexpected import: ${id}`)
    }}, {filename})
    return exports
  }
  function load(path) {
    const filename = [path, path + '.ts', path.replace(/\.js$/, '.ts')].find(candidate => existsSync(candidate))
    assert.ok(filename, `Missing module: ${path}`)
    if (!modules.has(filename)) modules.set(filename, evaluate(readFileSync(filename, 'utf8'), filename))
    return modules.get(filename)
  }
  const drax = path => load(resolve(root, 'node_modules/@drax', path))
  const {HttpRestClient} = drax('common-front/src/clients/HttpRestClient.ts')
  const client = new HttpRestClient()
  const clientFactory = {getInstance: () => client}
  imports['@drax/common-front'] = {HttpRestClientFactory: clientFactory, HttpClientFactory: clientFactory}
  const {AuthHelper} = drax('identity-front/src/helpers/AuthHelper.ts')
  const {AuthSystem} = drax('identity-front/src/system/AuthSystem.ts')
  const {AuthRestProvider} = drax('identity-front/src/providers/rest/AuthRestProvider.ts')
  const authSystem = new AuthSystem(new AuthRestProvider(client))
  imports['@drax/identity-front'] = {AuthHelper, AuthSystemFactory: {getInstance: () => authSystem}}
  const {useAuthStore} = drax('identity-vue/src/stores/AuthStore.ts')
  const authSession = drax('identity-vue/src/composables/setupAuthSession.ts')
  imports['vue-router'] = {useRouter: () => ({push: async () => {}})}
  const {useAuth} = drax('identity-vue/src/composables/useAuth.ts')
  imports['@drax/identity-vue'] = {useAuth, IdentityRememberMe: {}}
  imports['@/modules/google/providers/GoogleProvider'] = load(resolve(root, 'src/modules/google/providers/GoogleProvider.ts'))
  imports['@/composables/useDarkMode'] = {useDarkMode: () => ({darkMode: vue.ref(false)})}
  imports['vue-i18n'] = {useI18n: () => ({t: key => key})}
  const state = evaluate(script + '\nexport {rememberMe, loading, loginFailed};', 'GoogleLogin.vue')
  return {
    ...state, auth: useAuth(), store: useAuthStore(), client, requests, events, storage, ...authSession,
    login: () => globals.window.handleCredentialResponse({credential: 'fixture-google-credential'}),
    network: handler => { network = handler },
  }
}

for (const [enabled, selected] of [[false, false], [false, true], [true, false], [true, true]]) {
  const h = harness(enabled)
  assert.equal(h.rememberMe.value, false)
  h.rememberMe.value = selected
  await h.setupAuthSession()
  await h.login()
  const exchange = h.requests.find(request => request.url === '/api/google/login')
  assert.equal(exchange.body.rememberMe, enabled && selected)
  assert.equal(exchange.headers.Authorization, undefined)
  assert.equal(h.store.authUser.id, 'google-user')
  assert.equal(Boolean(h.store.refreshToken), enabled && selected)
  assert.equal(Boolean(JSON.parse(h.storage.get('AuthStore')).refreshToken), enabled && selected)
  assert.equal(h.client.baseHeaders.Authorization === `Bearer ${h.store.accessToken}`, true)
  assert.deepEqual(h.events, ['loginSuccess'])
  assert.equal(h.loading.value, false)
}

// A logout during exchange must discard the late response and revoke its refresh token.
{
  const h = harness()
  const exchange = deferred()
  const started = deferred()
  h.rememberMe.value = true
  h.network(async url => {
    if (url === '/api/google/login') { started.resolve(); return exchange.promise }
    return {}
  })
  const login = h.login()
  await started.promise
  await h.auth.logout()
  exchange.resolve(session())
  await login
  assert.equal(h.store.accessToken, null)
  assert.equal(h.store.refreshToken, null)
  assert.equal(h.store.authUser, null)
  assert.equal(h.client.baseHeaders.Authorization, undefined)
  assert.deepEqual(h.events, ['loginFail'])
  assert.equal(h.requests.some(request => request.url === '/api/auth/logout'), true)
}

// Logout while the profile is pending must not restore it or signal a successful login.
{
  const h = harness()
  const profile = deferred()
  const started = deferred()
  h.rememberMe.value = true
  h.network(async url => {
    if (url === '/api/auth/me') { started.resolve(); return profile.promise }
    return session()
  })
  const login = h.login()
  await started.promise
  await h.auth.logout()
  profile.resolve({id: 'late-user'})
  await login
  assert.equal(h.store.accessToken, null)
  assert.equal(h.store.authUser, null)
  assert.deepEqual(h.events, ['loginFail'])
}

// A newer login invalidates an older external exchange even if its response arrives later.
{
  const h = harness()
  const exchange = deferred()
  const started = deferred()
  h.rememberMe.value = true
  h.network(async url => {
    if (url === '/api/google/login') { started.resolve(); return exchange.promise }
    if (url === '/api/auth/me') return {id: 'newer-user'}
    return {}
  })
  const login = h.login()
  await started.promise
  await h.auth.loginWithSession(async () => ({...session(), refreshToken: 'fixture-newer-refresh'}), true)
  exchange.resolve(session())
  await login
  assert.equal(h.store.authUser.id, 'newer-user')
  assert.deepEqual(h.events, ['loginFail'])
  assert.equal(h.requests.some(request => request.url === '/api/auth/logout'), true)
}

// A failed initial profile fetch must fail login, not navigate or retain credentials.
{
  const h = harness()
  h.rememberMe.value = true
  h.network(async url => {
    if (url === '/api/auth/me') throw new TypeError('Offline fixture')
    return session()
  })
  await h.login()
  assert.equal(h.loginFailed.value, true)
  assert.equal(h.store.accessToken, null)
  assert.deepEqual(h.events, ['loginFail'])
}

// Restore and concurrently refresh a remembered Google session through the existing preflight.
{
  const h = harness()
  h.rememberMe.value = true
  await h.login()
  h.store.setSession({...session(), accessToken: jwt(1)})
  await h.setupAuthSession()
  assert.equal(h.requests.filter(request => request.url === '/api/auth/refresh').length, 1)
  h.store.setSession({...session(), accessToken: jwt(1)})
  await Promise.all([h.client.get('/api/fixture/one'), h.client.get('/api/fixture/two')])
  assert.equal(h.requests.filter(request => request.url === '/api/auth/refresh').length, 2)
  for (const request of h.requests.filter(request => request.url.startsWith('/api/fixture/'))) {
    assert.equal(request.headers.Authorization === `Bearer ${h.store.accessToken}`, true)
  }
  await h.auth.logout()
  assert.equal(h.store.refreshToken, null)
  assert.equal(h.requests.some(request => request.url === '/api/auth/logout'), true)
}

assert.match(component, /<IdentityRememberMe v-model="rememberMe" :disabled="loading"/)
console.log('Google login session integration assertions passed.')
