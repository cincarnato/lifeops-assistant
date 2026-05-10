
import merge from "deepmerge";
import GoalMessages from "./Goal-i18n"
import ProjectMessages from "./Project-i18n"
import ClientMessages from "./Client-i18n"
import ContactMessages from "./Contact-i18n"
import CompanyMessages from "./Company-i18n"
import TaskTypeMessages from "./TaskType-i18n"
import TaskStatusMessages from "./TaskStatus-i18n"
import TaskPriorityMessages from "./TaskPriority-i18n"
import TaskSourceMessages from "./TaskSource-i18n"
import TaskMessages from "./Task-i18n"

const messages = merge.all([
    GoalMessages,
    ProjectMessages,
    ClientMessages,
    ContactMessages,
    CompanyMessages,
    TaskTypeMessages,
    TaskStatusMessages,
    TaskPriorityMessages,
    TaskSourceMessages,
    TaskMessages
])

export default messages
