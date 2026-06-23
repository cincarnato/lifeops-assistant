
import TaskDashboardPage from "../pages/TaskDashboardPage.vue";



const CustomRoute = [
  {
    name: 'TaskDashboardPage',
    path: '/task/dashboard',
    component: TaskDashboardPage,
    meta: {
      auth: true,
      permission: 'task:manage',
      layout: 'base'
    }
  },

]

export default CustomRoute
export { CustomRoute }
