import PushMessageReceptionPage from "../pages/PushMessageReceptionPage.vue";

const PushMessageReceptionRoute = [
  {
    name: 'PushMessageReceptionPage',
    path: '/push/:idpush',
    component: PushMessageReceptionPage,
    meta: {
      auth: false,
    }
  },
]

export default PushMessageReceptionRoute
export { PushMessageReceptionRoute }
