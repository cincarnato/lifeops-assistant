
import DayPlanCrudPage from "../pages/crud/DayPlanCrudPage.vue";


const DayPlanCrudRoute = [
  {
    name: 'DayPlanningPage',
    path: '/day-planning',
    component: () => import('../pages/DayPlanningPage.vue'),
    meta: {auth: true, permission: 'dayplan:manage'}
  },
  {
    name: 'DayPlanCrudPage',
    path: '/crud/dayplan',
    component: DayPlanCrudPage,
    meta: {
      auth: true,
      permission: 'dayplan:manage',
    }
  },
]

export default DayPlanCrudRoute
export { DayPlanCrudRoute }
