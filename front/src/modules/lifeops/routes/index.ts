import GoalCrudRoute from "./GoalCrudRoute"
import ProjectCrudRoute from "./ProjectCrudRoute"
import BusinessPartnerCrudRoute from "./BusinessPartnerCrudRoute"
import ContactCrudRoute from "./ContactCrudRoute"

import TaskTypeCrudRoute from "./TaskTypeCrudRoute"
import TaskStatusCrudRoute from "./TaskStatusCrudRoute"
import SourceCrudRoute from "./SourceCrudRoute"
import TaskCrudRoute from "./TaskCrudRoute"
import TaskScheduleCrudRoute from "./TaskScheduleCrudRoute"
import PriorityCrudRoute from "./PriorityCrudRoute"
import ChatbotTaskRoute from "./ChatbotTaskRoute"
import KanbanTaskRoute from "./KanbanTaskRoute"
import ContactTypeCrudRoute from "./ContactTypeCrudRoute"

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
import DayPlanCrudRoute from "./DayPlanCrudRoute"

export const routes = [
  ...GoalCrudRoute,
  ...ProjectCrudRoute,
  ...BusinessPartnerCrudRoute,
  ...ContactCrudRoute,
  ...TaskTypeCrudRoute,
  ...TaskStatusCrudRoute,
  ...SourceCrudRoute,
  ...TaskCrudRoute,
  ...TaskScheduleCrudRoute,
  ...PriorityCrudRoute,
  ...ContactTypeCrudRoute,
  ...AgentRoute,
  ...AgentJobCrudRoute,
  ...AgentJobExecutionCrudRoute,
  ...MemoryCrudRoute,
  ...MemoryTypeCrudRoute,
  ...PurposeCrudRoute,
  ...LifeAreaCrudRoute,
  ...HabitCrudRoute,
  ...HabitLogCrudRoute,
  ...DayPlanCrudRoute,
  ...ChatbotTaskRoute,
  ...KanbanTaskRoute,
  ...CustomRoute
]

export default routes
