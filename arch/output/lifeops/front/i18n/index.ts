
import merge from "deepmerge";
import GoalMessages from "./Goal-i18n"
import ProjectMessages from "./Project-i18n"
import ClientMessages from "./Client-i18n"
import ContactMessages from "./Contact-i18n"
import CompanyMessages from "./Company-i18n"
import TaskTypeMessages from "./TaskType-i18n"
import TaskStatusMessages from "./TaskStatus-i18n"
import TaskSourceMessages from "./TaskSource-i18n"
import TaskMessages from "./Task-i18n"
import PriorityMessages from "./Priority-i18n"
import ContactTypeMessages from "./ContactType-i18n"
import CompanyTypeMessages from "./CompanyType-i18n"
import ClientTypeMessages from "./ClientType-i18n"
import AgentJobMessages from "./AgentJob-i18n"
import AgentJobExecutionMessages from "./AgentJobExecution-i18n"

const messages = merge.all([
    GoalMessages,
    ProjectMessages,
    ClientMessages,
    ContactMessages,
    CompanyMessages,
    TaskTypeMessages,
    TaskStatusMessages,
    TaskSourceMessages,
    TaskMessages,
    PriorityMessages,
    ContactTypeMessages,
    CompanyTypeMessages,
    ClientTypeMessages,
    AgentJobMessages,
    AgentJobExecutionMessages
])

export default messages
