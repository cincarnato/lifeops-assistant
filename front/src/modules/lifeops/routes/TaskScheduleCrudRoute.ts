
import TaskScheduleCrudPage from "../pages/crud/TaskScheduleCrudPage.vue";


const TaskScheduleCrudRoute = [
  {
    name: 'TaskScheduleCrudPage',
    path: '/crud/taskschedule',
    component: TaskScheduleCrudPage,
    meta: {
      auth: true,
      permission: 'taskschedule:manage',
    }
  },
]

export default TaskScheduleCrudRoute
export { TaskScheduleCrudRoute }
