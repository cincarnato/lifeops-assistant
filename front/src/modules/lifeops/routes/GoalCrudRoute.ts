
import GoalCrudPage from "../pages/crud/GoalCrudPage.vue";


const GoalCrudRoute = [
  {
    name: 'GoalCrudPage',
    path: '/crud/goal',
    component: GoalCrudPage,
    meta: {
      auth: true,
      permission: 'goal:manage',
    }
  },
]

export default GoalCrudRoute
export { GoalCrudRoute }
