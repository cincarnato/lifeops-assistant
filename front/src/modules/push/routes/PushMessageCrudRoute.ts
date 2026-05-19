
import PushMessageCrudPage from "../pages/crud/PushMessageCrudPage.vue";


const PushMessageCrudRoute = [
  {
    name: 'PushMessageCrudPage',
    path: '/crud/pushmessage',
    component: PushMessageCrudPage,
    meta: {
      auth: true,
      permission: 'pushmessage:manage',
    }
  },
]

export default PushMessageCrudRoute
export { PushMessageCrudRoute }
