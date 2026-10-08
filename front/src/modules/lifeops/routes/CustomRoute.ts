
import TaskDashboardPage from "../pages/TaskDashboardPage.vue";
import CommandCenterPage from '../pages/CommandCenterPage.vue'



const CustomRoute = [
  {
    name: 'CommandCenterPage',
    path: '/command-center',
    component: CommandCenterPage,
    meta: {auth: true, layout: 'base'}
  },
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
