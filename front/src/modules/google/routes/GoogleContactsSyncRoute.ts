import GoogleContactsSyncPage from "../pages/GoogleContactsSyncPage.vue";

const GoogleContactsSyncRoute = [
  {
    name: 'GoogleContactsSyncPage',
    path: '/google/contacts/sync',
    component: GoogleContactsSyncPage,
    meta: {
      auth: true,
      permission: 'googleconnection:view',
    }
  },
]

export default GoogleContactsSyncRoute
export { GoogleContactsSyncRoute }
