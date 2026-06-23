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
import ChatbotTaskRoute from "./ChatbotTaskRoute"
import KanbanTaskRoute from "./KanbanTaskRoute"
import ContactTypeCrudRoute from "./ContactTypeCrudRoute"
import CompanyTypeCrudRoute from "./CompanyTypeCrudRoute"
import ClientTypeCrudRoute from "./ClientTypeCrudRoute"
import AgentJobCrudRoute from "./AgentJobCrudRoute"
import AgentRoute from "./AgentRoute"
import CustomRoute from "./CustomRoute"
import AgentJobExecutionCrudRoute from "./AgentJobExecutionCrudRoute"
import MemoryCrudRoute from "./MemoryCrudRoute"
import MemoryTypeCrudRoute from "./MemoryTypeCrudRoute"
import PurposeCrudRoute from "./PurposeCrudRoute"
import LifeAreaCrudRoute from "./LifeAreaCrudRoute"
import HabitCrudRoute from "./HabitCrudRoute"
import HabitLogCrudRoute from "./HabitLogCrudRoute"

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
  ...AgentRoute,
  ...AgentJobCrudRoute,
  ...AgentJobExecutionCrudRoute,
  ...MemoryCrudRoute,
  ...MemoryTypeCrudRoute,
  ...PurposeCrudRoute,
  ...LifeAreaCrudRoute,
  ...HabitCrudRoute,
  ...HabitLogCrudRoute,
  ...ChatbotTaskRoute,
  ...KanbanTaskRoute,
  ...CustomRoute
]

export default routes
