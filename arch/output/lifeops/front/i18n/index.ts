
import merge from "deepmerge";
import GoalMessages from "./Goal-i18n"
import ProjectMessages from "./Project-i18n"
import BusinessPartnerMessages from "./BusinessPartner-i18n"
import ServiceMessages from "./Service-i18n"
import ServiceTransactionMessages from "./ServiceTransaction-i18n"
import ContactMessages from "./Contact-i18n"
import TaskTypeMessages from "./TaskType-i18n"
import TaskStatusMessages from "./TaskStatus-i18n"
import SourceMessages from "./Source-i18n"
import TaskMessages from "./Task-i18n"
import TaskScheduleMessages from "./TaskSchedule-i18n"
import PriorityMessages from "./Priority-i18n"
import ContactTypeMessages from "./ContactType-i18n"
import AgentJobMessages from "./AgentJob-i18n"
import AgentJobExecutionMessages from "./AgentJobExecution-i18n"
import MemoryMessages from "./Memory-i18n"
import MemoryTypeMessages from "./MemoryType-i18n"
import PurposeMessages from "./Purpose-i18n"
import LifeAreaMessages from "./LifeArea-i18n"
import HabitMessages from "./Habit-i18n"
import HabitLogMessages from "./HabitLog-i18n"
import DayPlanMessages from "./DayPlan-i18n"

const messages = merge.all([
    GoalMessages,
    ProjectMessages,
    BusinessPartnerMessages,
    ServiceMessages,
    ServiceTransactionMessages,
    ContactMessages,
    TaskTypeMessages,
    TaskStatusMessages,
    SourceMessages,
    TaskMessages,
    TaskScheduleMessages,
    PriorityMessages,
    ContactTypeMessages,
    AgentJobMessages,
    AgentJobExecutionMessages,
    MemoryMessages,
    MemoryTypeMessages,
    PurposeMessages,
    LifeAreaMessages,
    HabitMessages,
    HabitLogMessages,
    DayPlanMessages
])

export default messages
