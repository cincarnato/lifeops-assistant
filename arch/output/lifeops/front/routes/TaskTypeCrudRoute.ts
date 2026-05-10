
import TaskTypeCrudPage from "../pages/crud/TaskTypeCrudPage.vue";


const TaskTypeCrudRoute = [
  {
    name: 'TaskTypeCrudPage',
    path: '/crud/tasktype',
    component: TaskTypeCrudPage,
    meta: {
      auth: true,
      permission: 'tasktype:manage',
    }
  },
]

export default TaskTypeCrudRoute
export { TaskTypeCrudRoute }
