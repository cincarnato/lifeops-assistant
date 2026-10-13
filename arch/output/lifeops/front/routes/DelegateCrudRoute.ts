import DelegateCrudPage from "../pages/crud/DelegateCrudPage.vue";


const DelegateCrudRoute = [
  {
    name: 'DelegateCrudPage',
    path: '/crud/delegate',
    component: DelegateCrudPage,
    meta: {
      auth: true,
      permission: 'delegate:manage',
    }
  },
]

export default DelegateCrudRoute
export { DelegateCrudRoute }
