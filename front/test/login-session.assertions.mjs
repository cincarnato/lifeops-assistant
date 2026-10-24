import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {runInNewContext} from 'node:vm'
import ts from 'typescript'

const page = readFileSync(new URL('../src/modules/base/pages/user/LoginPage.vue', import.meta.url), 'utf8')
const script = page.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  .replace(/import\.meta\.env\.\w+/g, 'undefined')
const output = ts.transpileModule(script, {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
}).outputText

function mountLogin({accessToken = 'expired', valid = false, rememberMe = false, refreshToken = null} = {}) {
  const store = {accessToken, refreshToken, authUser: {id: 'user'}}
  let authorization = accessToken ? `Bearer ${accessToken}` : null
  let logoutCalls = 0
  const imports = {
    '@drax/identity-vue': {
      IdentityLogin: {},
      useAuthStore: () => store,
      isRememberMeEnabled: () => rememberMe,
      useAuth: () => ({
        tokenIsValid: () => valid,
        logout: () => {
          logoutCalls++
          store.accessToken = null
          store.authUser = null
          store.refreshToken = null
          authorization = null
        },
      }),
    },
    vuetify: {
      useDisplay: () => ({mobile: false}),
      useTheme: () => ({current: {value: {colors: {primary: 'blue', background: 'white'}}}}),
    },
    'vue-router': {useRouter: () => ({push: () => {}})},
    '@/modules/google/components/GoogleLogin.vue': {default: {}},
    '@/assets/jarvops_120.png': {default: 'logo'},
  }
  runInNewContext(output, {
    exports: {},
    computed: getter => ({value: getter()}),
    require: id => {
      assert.ok(id in imports, `Unexpected import: ${id}`)
      return imports[id]
    },
  })
  return {store, authorization, logoutCalls}
}

const expired = mountLogin()
assert.equal(expired.logoutCalls, 1)
assert.equal(expired.store.accessToken, null)
assert.equal(expired.store.authUser, null)
assert.equal(expired.authorization, null)
assert.equal(mountLogin({valid: true}).logoutCalls, 0)
assert.equal(mountLogin({accessToken: null}).logoutCalls, 0)
assert.equal(mountLogin({rememberMe: true}).logoutCalls, 1)
assert.equal(mountLogin({rememberMe: true, refreshToken: 'recoverable'}).logoutCalls, 0)
assert.equal(mountLogin({rememberMe: false, refreshToken: 'stale'}).logoutCalls, 1)
console.log('Login page session cleanup assertions passed.')
