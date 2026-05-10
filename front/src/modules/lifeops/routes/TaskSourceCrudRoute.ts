
import TaskSourceCrudPage from "../pages/crud/TaskSourceCrudPage.vue";


const TaskSourceCrudRoute = [
  {
    name: 'TaskSourceCrudPage',
    path: '/crud/tasksource',
    component: TaskSourceCrudPage,
    meta: {
      auth: true,
      permission: 'tasksource:manage',
    }
  },
]

export default TaskSourceCrudRoute
export { TaskSourceCrudRoute }
