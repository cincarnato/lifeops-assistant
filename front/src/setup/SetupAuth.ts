import {setupAuthSession} from '@drax/identity-vue'

async function setupAuth() {
  await setupAuthSession()
}

export {setupAuth}
