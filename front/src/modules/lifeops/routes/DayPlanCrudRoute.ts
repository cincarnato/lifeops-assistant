
import DayPlanCrudPage from "../pages/crud/DayPlanCrudPage.vue";


const DayPlanCrudRoute = [
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
