import GoogleGmailPage from "../pages/GoogleGmailPage.vue";

const GoogleGmailRoute = [
  {
    name: 'GoogleGmailPage',
    path: '/google/gmail',
    component: GoogleGmailPage,
    meta: {
      auth: true,
      permission: 'googleconnection:view',
    }
  },
]

export default GoogleGmailRoute
export { GoogleGmailRoute }
