
import TaskStatusCrudPage from "../pages/crud/TaskStatusCrudPage.vue";


const TaskStatusCrudRoute = [
  {
    name: 'TaskStatusCrudPage',
    path: '/crud/taskstatus',
    component: TaskStatusCrudPage,
    meta: {
      auth: true,
      permission: 'taskstatus:manage',
    }
  },
]

export default TaskStatusCrudRoute
export { TaskStatusCrudRoute }
