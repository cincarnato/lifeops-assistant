import GoogleCalendarPage from "../pages/GoogleCalendarPage.vue";

const GoogleCalendarRoute = [
  {
    name: 'GoogleCalendarPage',
    path: '/google/calendar',
    component: GoogleCalendarPage,
    meta: {
      auth: true,
      permission: 'googleconnection:view',
    }
  }
]

export default GoogleCalendarRoute
export { GoogleCalendarRoute }
