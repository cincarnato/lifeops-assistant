import GoogleLoginCallback from "@/modules/google/pages/GoogleLoginCallback.vue";
import GoogleConnectionCrudRoute from "./GoogleConnectionCrudRoute";
import GoogleConnectionRoute from "./GoogleConnectionRoute";
import GoogleGmailRoute from "./GoogleGmailRoute";
import GoogleCalendarRoute from "./GoogleCalendarRoute";
import GoogleContactsSyncRoute from "./GoogleContactsSyncRoute";

const index = [
  ...GoogleConnectionCrudRoute,
  ...GoogleConnectionRoute,
  ...GoogleGmailRoute,
  ...GoogleCalendarRoute,
  ...GoogleContactsSyncRoute,

  {
    name: 'GoogleLoginCallback',
    path: '/login/google/callback',
    component: GoogleLoginCallback,
    meta: {
      auth: false,
    }
  }
]


export default index
