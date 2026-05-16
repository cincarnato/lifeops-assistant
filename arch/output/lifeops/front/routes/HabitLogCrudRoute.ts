
import HabitLogCrudPage from "../pages/crud/HabitLogCrudPage.vue";


const HabitLogCrudRoute = [
  {
    name: 'HabitLogCrudPage',
    path: '/crud/habitlog',
    component: HabitLogCrudPage,
    meta: {
      auth: true,
      permission: 'habitlog:manage',
    }
  },
]

export default HabitLogCrudRoute
export { HabitLogCrudRoute }
