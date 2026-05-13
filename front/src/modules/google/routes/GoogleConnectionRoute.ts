import GoogleConnectionPage from "../pages/GoogleConnectionPage.vue";
import GoogleConnectionCallbackPage from "../pages/GoogleConnectionCallbackPage.vue";

const GoogleConnectionRoute = [
  {
    name: 'GoogleConnectionPage',
    path: '/google/connections',
    component: GoogleConnectionPage,
    meta: {
      auth: true,
      permission: 'googleconnection:manage',
    }
  },
  {
    name: 'GoogleConnectionCallbackPage',
    path: '/google/connections/callback',
    component: GoogleConnectionCallbackPage,
    meta: {
      auth: true,
      permission: 'googleconnection:manage',
    }
  },
]

export default GoogleConnectionRoute
export { GoogleConnectionRoute }
