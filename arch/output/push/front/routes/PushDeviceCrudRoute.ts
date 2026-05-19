
import PushDeviceCrudPage from "../pages/crud/PushDeviceCrudPage.vue";


const PushDeviceCrudRoute = [
  {
    name: 'PushDeviceCrudPage',
    path: '/crud/pushdevice',
    component: PushDeviceCrudPage,
    meta: {
      auth: true,
      permission: 'pushdevice:manage',
    }
  },
]

export default PushDeviceCrudRoute
export { PushDeviceCrudRoute }
