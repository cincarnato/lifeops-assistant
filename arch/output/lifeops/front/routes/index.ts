
import GoalCrudRoute from "./GoalCrudRoute"
import ProjectCrudRoute from "./ProjectCrudRoute"
import ClientCrudRoute from "./ClientCrudRoute"
import ContactCrudRoute from "./ContactCrudRoute"
import CompanyCrudRoute from "./CompanyCrudRoute"
import TaskTypeCrudRoute from "./TaskTypeCrudRoute"
import TaskStatusCrudRoute from "./TaskStatusCrudRoute"
import TaskPriorityCrudRoute from "./TaskPriorityCrudRoute"
import TaskSourceCrudRoute from "./TaskSourceCrudRoute"
import TaskCrudRoute from "./TaskCrudRoute"

export const routes = [
    ...GoalCrudRoute,
...ProjectCrudRoute,
...ClientCrudRoute,
...ContactCrudRoute,
...CompanyCrudRoute,
...TaskTypeCrudRoute,
...TaskStatusCrudRoute,
...TaskPriorityCrudRoute,
...TaskSourceCrudRoute,
...TaskCrudRoute
]

export default routes
