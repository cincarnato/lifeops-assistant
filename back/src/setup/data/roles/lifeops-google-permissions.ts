import AgentJobPermissions from "../../../modules/lifeops/permissions/AgentJobPermissions.js";
import AgentJobExecutionPermissions from "../../../modules/lifeops/permissions/AgentJobExecutionPermissions.js";
import BusinessPartnerPermissions from "../../../modules/lifeops/permissions/BusinessPartnerPermissions.js";
import ContactPermissions from "../../../modules/lifeops/permissions/ContactPermissions.js";
import DayPlanPermissions from "../../../modules/lifeops/permissions/DayPlanPermissions.js";
import DelegatePermissions from "../../../modules/lifeops/permissions/DelegatePermissions.js";
import GoalPermissions from "../../../modules/lifeops/permissions/GoalPermissions.js";
import HabitPermissions from "../../../modules/lifeops/permissions/HabitPermissions.js";
import HabitLogPermissions from "../../../modules/lifeops/permissions/HabitLogPermissions.js";
import InstructionPermissions from "../../../modules/lifeops/permissions/InstructionPermissions.js";
import MemoryPermissions from "../../../modules/lifeops/permissions/MemoryPermissions.js";
import ProjectPermissions from "../../../modules/lifeops/permissions/ProjectPermissions.js";
import PurposePermissions from "../../../modules/lifeops/permissions/PurposePermissions.js";
import ServicePermissions from "../../../modules/lifeops/permissions/ServicePermissions.js";
import ServiceTransactionPermissions from "../../../modules/lifeops/permissions/ServiceTransactionPermissions.js";
import ShoppingItemPermissions from "../../../modules/lifeops/permissions/ShoppingItemPermissions.js";
import TaskPermissions from "../../../modules/lifeops/permissions/TaskPermissions.js";
import TaskSchedulePermissions from "../../../modules/lifeops/permissions/TaskSchedulePermissions.js";
import GoogleConnectionPermissions from "../../../modules/google/permissions/GoogleConnectionPermissions.js";

const lifeopsGooglePermissions = [
    ...Object.values(AgentJobPermissions),
    ...Object.values(AgentJobExecutionPermissions),
    ...Object.values(BusinessPartnerPermissions),
    ...Object.values(ContactPermissions),
    ...Object.values(DayPlanPermissions),
    ...Object.values(DelegatePermissions),
    ...Object.values(GoalPermissions),
    ...Object.values(HabitPermissions),
    ...Object.values(HabitLogPermissions),
    ...Object.values(InstructionPermissions),
    ...Object.values(MemoryPermissions),
    ...Object.values(ProjectPermissions),
    ...Object.values(PurposePermissions),
    ...Object.values(ServicePermissions),
    ...Object.values(ServiceTransactionPermissions),
    ...Object.values(ShoppingItemPermissions),
    ...Object.values(TaskPermissions),
    ...Object.values(TaskSchedulePermissions),
    ...Object.values(GoogleConnectionPermissions),
];

export default lifeopsGooglePermissions;
