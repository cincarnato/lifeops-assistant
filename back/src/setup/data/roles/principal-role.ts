import {UserPermissions, RolePermissions} from "@drax/identity-back";
import {AIPermissions, AgentPermissions, AgentSessionPermissions} from "@drax/ai-back";
import PriorityPermissions from "../../../modules/lifeops/permissions/PriorityPermissions.js";
import SourcePermissions from "../../../modules/lifeops/permissions/SourcePermissions.js";
import TaskStatusPermissions from "../../../modules/lifeops/permissions/TaskStatusPermissions.js";
import colaboradorRole from "./colaborador-role.js";
import lifeopsGooglePermissions from "./lifeops-google-permissions.js";

const role = {
    name: "Principal",
    permissions: [
        ...lifeopsGooglePermissions,
        ...Object.values(AIPermissions),
        ...Object.values(AgentPermissions),
        ...Object.values(AgentSessionPermissions),
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
    ],
    childRoles: [colaboradorRole.name],
    readonly: true,
};

export default role;
