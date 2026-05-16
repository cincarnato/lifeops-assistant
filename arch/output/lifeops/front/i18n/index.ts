
import merge from "deepmerge";
import GoalMessages from "./Goal-i18n"
import ProjectMessages from "./Project-i18n"
import ClientMessages from "./Client-i18n"
import ContactMessages from "./Contact-i18n"
import CompanyMessages from "./Company-i18n"
import TaskTypeMessages from "./TaskType-i18n"
import TaskStatusMessages from "./TaskStatus-i18n"
import SourceMessages from "./Source-i18n"
import TaskMessages from "./Task-i18n"
import PriorityMessages from "./Priority-i18n"
import ContactTypeMessages from "./ContactType-i18n"
import CompanyTypeMessages from "./CompanyType-i18n"
import ClientTypeMessages from "./ClientType-i18n"
import AgentJobMessages from "./AgentJob-i18n"
import AgentJobExecutionMessages from "./AgentJobExecution-i18n"
import MemoryMessages from "./Memory-i18n"
import MemoryTypeMessages from "./MemoryType-i18n"
import PurposeMessages from "./Purpose-i18n"
import LifeAreaMessages from "./LifeArea-i18n"
import HabitMessages from "./Habit-i18n"
import HabitLogMessages from "./HabitLog-i18n"

const messages = merge.all([
    GoalMessages,
    ProjectMessages,
    ClientMessages,
    ContactMessages,
    CompanyMessages,
    TaskTypeMessages,
    TaskStatusMessages,
    SourceMessages,
    TaskMessages,
    PriorityMessages,
    ContactTypeMessages,
    CompanyTypeMessages,
    ClientTypeMessages,
    AgentJobMessages,
    AgentJobExecutionMessages,
    MemoryMessages,
    MemoryTypeMessages,
    PurposeMessages,
    LifeAreaMessages,
    HabitMessages,
    HabitLogMessages
])

export default messages
