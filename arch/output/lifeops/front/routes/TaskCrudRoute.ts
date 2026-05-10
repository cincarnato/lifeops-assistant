
import TaskCrudPage from "../pages/crud/TaskCrudPage.vue";


const TaskCrudRoute = [
  {
    name: 'TaskCrudPage',
    path: '/crud/task',
    component: TaskCrudPage,
    meta: {
      auth: true,
      permission: 'task:manage',
    }
  },
]

export default TaskCrudRoute
export { TaskCrudRoute }
