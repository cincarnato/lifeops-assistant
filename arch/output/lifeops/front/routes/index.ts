
import GoalCrudRoute from "./GoalCrudRoute"
import ProjectCrudRoute from "./ProjectCrudRoute"
import BusinessPartnerCrudRoute from "./BusinessPartnerCrudRoute"
import ServiceCrudRoute from "./ServiceCrudRoute"
import ServiceTransactionCrudRoute from "./ServiceTransactionCrudRoute"
import ContactCrudRoute from "./ContactCrudRoute"
import TaskTypeCrudRoute from "./TaskTypeCrudRoute"
import TaskStatusCrudRoute from "./TaskStatusCrudRoute"
import SourceCrudRoute from "./SourceCrudRoute"
import ShoppingItemCrudRoute from "./ShoppingItemCrudRoute"
import TaskCrudRoute from "./TaskCrudRoute"
import TaskScheduleCrudRoute from "./TaskScheduleCrudRoute"
import InstructionCrudRoute from "./InstructionCrudRoute"
import PriorityCrudRoute from "./PriorityCrudRoute"
import ContactTypeCrudRoute from "./ContactTypeCrudRoute"
import AgentJobCrudRoute from "./AgentJobCrudRoute"
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
...ServiceCrudRoute,
...ServiceTransactionCrudRoute,
...ContactCrudRoute,
...TaskTypeCrudRoute,
...TaskStatusCrudRoute,
...SourceCrudRoute,
...ShoppingItemCrudRoute,
...TaskCrudRoute,
...TaskScheduleCrudRoute,
...InstructionCrudRoute,
...PriorityCrudRoute,
...ContactTypeCrudRoute,
...AgentJobCrudRoute,
...AgentJobExecutionCrudRoute,
...MemoryCrudRoute,
...MemoryTypeCrudRoute,
...PurposeCrudRoute,
...LifeAreaCrudRoute,
...HabitCrudRoute,
...HabitLogCrudRoute,
...DayPlanCrudRoute
]

export default routes
