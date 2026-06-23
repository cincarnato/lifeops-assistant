import HomePage from '@/modules/base/pages/home/index.vue'
import LandingPage from '@/modules/base/pages/landing/LandingPage.vue'
import LoginPage from "@/modules/base/pages/user/LoginPage.vue";
import PoliticaPrivacidad from "@/modules/base/pages/info/PoliticaPrivacidad.vue";
import CondicionesServicio from "@/modules/base/pages/info/CondicionesServicio.vue";
import AccountPrivacyPage from "@/modules/base/pages/account/AccountPrivacyPage.vue";
import NotificationTestPage from "@/modules/base/pages/notification/NotificationTestPage.vue";

const baseRoutes = [
  {
    name: 'LandingPage',
    path: '/',
    component: LandingPage,
    meta: {
      auth: false,
    }
  },
  {
    name: 'Home',
    path: '/home',
    component: HomePage,
    meta: {
      auth: true,
    }
  },
  {
    name: 'Login',
    path: '/login',
    component: LoginPage,
    meta: {
      auth: false,
    }
  },
  {
    name: 'NotificationTestPage',
    path: '/notification/test',
    component: NotificationTestPage,
    meta: {
      auth: true,
      permission: 'notification:manage'
    }
  },
  {
    name: 'PoliticaPrivacidad',
    path: '/politica-privacidad',
    component: PoliticaPrivacidad,
    meta: {
      auth: false,
    }
  },
  {
    name: 'CondicionesServicio',
    path: '/condiciones-servicio',
    component: CondicionesServicio,
    meta: {
      auth: false,
    }
  },
  {
    name: 'AccountPrivacy',
    path: '/account/privacy',
    component: AccountPrivacyPage,
    meta: {
      auth: true,
    }
  },
]


export default baseRoutes

export {baseRoutes}
