
import GoalCrudRoute from "./GoalCrudRoute"
import ProjectCrudRoute from "./ProjectCrudRoute"
import ClientCrudRoute from "./ClientCrudRoute"
import ContactCrudRoute from "./ContactCrudRoute"
import CompanyCrudRoute from "./CompanyCrudRoute"
import TaskTypeCrudRoute from "./TaskTypeCrudRoute"
import TaskStatusCrudRoute from "./TaskStatusCrudRoute"
import TaskSourceCrudRoute from "./TaskSourceCrudRoute"
import TaskCrudRoute from "./TaskCrudRoute"
import PriorityCrudRoute from "./PriorityCrudRoute"
import ContactTypeCrudRoute from "./ContactTypeCrudRoute"
import CompanyTypeCrudRoute from "./CompanyTypeCrudRoute"
import ClientTypeCrudRoute from "./ClientTypeCrudRoute"
import AgentJobCrudRoute from "./AgentJobCrudRoute"
import AgentJobExecutionCrudRoute from "./AgentJobExecutionCrudRoute"

export const routes = [
    ...GoalCrudRoute,
...ProjectCrudRoute,
...ClientCrudRoute,
...ContactCrudRoute,
...CompanyCrudRoute,
...TaskTypeCrudRoute,
...TaskStatusCrudRoute,
...TaskSourceCrudRoute,
...TaskCrudRoute,
...PriorityCrudRoute,
...ContactTypeCrudRoute,
...CompanyTypeCrudRoute,
...ClientTypeCrudRoute,
...AgentJobCrudRoute,
...AgentJobExecutionCrudRoute
]

export default routes
