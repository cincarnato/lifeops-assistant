import {UserPermissions, RolePermissions, UserApiKeyPermissions} from "@drax/identity-back";
import {AIPermissions, AgentPermissions, AgentSessionPermissions} from "@drax/ai-back";
import LifeAreaPermissions from "../../../modules/lifeops/permissions/LifeAreaPermissions.js";
import MemoryTypePermissions from "../../../modules/lifeops/permissions/MemoryTypePermissions.js";
import TaskTypePermissions from "../../../modules/lifeops/permissions/TaskTypePermissions.js";
import ContactTypePermissions from "../../../modules/lifeops/permissions/ContactTypePermissions.js";
import PriorityPermissions from "../../../modules/lifeops/permissions/PriorityPermissions.js";
import SourcePermissions from "../../../modules/lifeops/permissions/SourcePermissions.js";
import TaskStatusPermissions from "../../../modules/lifeops/permissions/TaskStatusPermissions.js";
import colaboradorRole from "./colaborador-role.js";
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

const role = {
    name: "Principal",
    permissions: [
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
        ...Object.values(AIPermissions),
        ...Object.values(AgentPermissions),
        ...Object.values(AgentSessionPermissions),
        LifeAreaPermissions.View,
        MemoryTypePermissions.View,
        TaskTypePermissions.View,
        ContactTypePermissions.View,
        PriorityPermissions.View,
        SourcePermissions.View,
        TaskStatusPermissions.View,
        UserPermissions.Create,
        UserPermissions.View,
        UserPermissions.Update,
        UserPermissions.Delete,
        UserPermissions.Manage,
        UserPermissions.ChangePassword,
        RolePermissions.View,
        UserApiKeyPermissions.Create,
        UserApiKeyPermissions.Manage,
        UserApiKeyPermissions.View,
        UserApiKeyPermissions.Update,
        UserApiKeyPermissions.Delete
    ],
    childRoles: [colaboradorRole.name],
    readonly: true,
};

export default role;
