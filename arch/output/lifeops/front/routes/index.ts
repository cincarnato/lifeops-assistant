
import GoalCrudRoute from "./GoalCrudRoute"
import ProjectCrudRoute from "./ProjectCrudRoute"
import ClientCrudRoute from "./ClientCrudRoute"
import ContactCrudRoute from "./ContactCrudRoute"
import CompanyCrudRoute from "./CompanyCrudRoute"
import TaskTypeCrudRoute from "./TaskTypeCrudRoute"
import TaskStatusCrudRoute from "./TaskStatusCrudRoute"
import SourceCrudRoute from "./SourceCrudRoute"
import TaskCrudRoute from "./TaskCrudRoute"
import PriorityCrudRoute from "./PriorityCrudRoute"
import ContactTypeCrudRoute from "./ContactTypeCrudRoute"
import CompanyTypeCrudRoute from "./CompanyTypeCrudRoute"
import ClientTypeCrudRoute from "./ClientTypeCrudRoute"
import AgentJobCrudRoute from "./AgentJobCrudRoute"
import AgentJobExecutionCrudRoute from "./AgentJobExecutionCrudRoute"
import MemoryCrudRoute from "./MemoryCrudRoute"
import MemoryTypeCrudRoute from "./MemoryTypeCrudRoute"

export const routes = [
    ...GoalCrudRoute,
...ProjectCrudRoute,
...ClientCrudRoute,
...ContactCrudRoute,
...CompanyCrudRoute,
...TaskTypeCrudRoute,
...TaskStatusCrudRoute,
...SourceCrudRoute,
...TaskCrudRoute,
...PriorityCrudRoute,
...ContactTypeCrudRoute,
...CompanyTypeCrudRoute,
...ClientTypeCrudRoute,
...AgentJobCrudRoute,
...AgentJobExecutionCrudRoute,
...MemoryCrudRoute,
...MemoryTypeCrudRoute
]

export default routes
