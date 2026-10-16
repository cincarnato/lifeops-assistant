import {createRouter, createWebHistory} from 'vue-router'

import {setupLayouts} from 'virtual:generated-layouts'
import draxRoutes from './drax-routes'
import modulesRoutes from './modules-routes'


const routes = setupLayouts([
  ...modulesRoutes,
  ...draxRoutes
])


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

import {isRememberMeEnabled, refreshAuthSession, useAuth, useAuthStore} from "@drax/identity-vue";

router.beforeEach(async (to) => {
  try {
    await refreshAuthSession()
  } catch {
    // Rejected credentials are cleared by Identity; transient failures remain recoverable.
  }

  const {isAuthenticated, hasPermission} = useAuth()
  const requiresAuth = !['Login'].includes(to.name as string) && to.meta.auth
  const requiresPermission = to.meta.permission as string | undefined

  if (requiresAuth || requiresPermission) {
    const authStore = useAuthStore()
    if (!isAuthenticated() && isRememberMeEnabled() && authStore.refreshToken) {
      return false
    }
  }

  if ((requiresAuth && !isAuthenticated()) || (requiresPermission && !hasPermission(requiresPermission))) {
    return {path: '/login', query: {redirect: to.fullPath}}
  }
})

export default router
