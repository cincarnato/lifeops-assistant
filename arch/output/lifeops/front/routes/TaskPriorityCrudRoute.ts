
import TaskPriorityCrudPage from "../pages/crud/TaskPriorityCrudPage.vue";


const TaskPriorityCrudRoute = [
  {
    name: 'TaskPriorityCrudPage',
    path: '/crud/taskpriority',
    component: TaskPriorityCrudPage,
    meta: {
      auth: true,
      permission: 'taskpriority:manage',
    }
  },
]

export default TaskPriorityCrudRoute
export { TaskPriorityCrudRoute }
