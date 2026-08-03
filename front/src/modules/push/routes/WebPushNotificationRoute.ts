import WebPushNotificationPage from "../pages/WebPushNotificationPage.vue";

const WebPushNotificationRoute = [
  {
    name: 'WebPushNotificationPage',
    path: '/push/web',
    component: WebPushNotificationPage,
    meta: {
      auth: true,
    }
  },
]

export default WebPushNotificationRoute
export { WebPushNotificationRoute }
