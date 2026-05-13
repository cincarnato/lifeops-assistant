import {LoadPermissions} from "@drax/identity-back";
import {
    UserPermissions,
    RolePermissions,
    TenantPermissions,
    UserApiKeyPermissions,
    UserLoginFailPermissions,
    UserSessionPermissions
} from "@drax/identity-back";
import {MediaPermissions, FilePermissions} from "@drax/media-back";
import {SettingPermissions} from "@drax/settings-back";
import {DashboardPermissions} from "@drax/dashboard-back";
import {AuditPermissions} from "@drax/audit-back";
import {AILogPermissions, AIPermissions, AgentSessionPermissions, AgentPermissions} from "@drax/ai-back";
import {CrudSavedQueryPermissions} from "@drax/crud-back";

import {BasePermissions} from "../modules/base/permissions/BasePermissions.js";
import {NotificationPermissions} from "../modules/base/permissions/NotificationPermissions.js";
import {GoalPermissions} from "../modules/lifeops/permissions/GoalPermissions.js";
import {ProjectPermissions} from "../modules/lifeops/permissions/ProjectPermissions.js";
import {ClientPermissions} from "../modules/lifeops/permissions/ClientPermissions.js";
import {ContactPermissions} from "../modules/lifeops/permissions/ContactPermissions.js";
import {CompanyPermissions} from "../modules/lifeops/permissions/CompanyPermissions.js";
import {TaskTypePermissions} from "../modules/lifeops/permissions/TaskTypePermissions.js";
import {TaskStatusPermissions} from "../modules/lifeops/permissions/TaskStatusPermissions.js";
import {TaskSourcePermissions} from "../modules/lifeops/permissions/TaskSourcePermissions.js";
import {TaskPermissions} from "../modules/lifeops/permissions/TaskPermissions.js";
import {PriorityPermissions} from "../modules/lifeops/permissions/PriorityPermissions.js";
import {ContactTypePermissions} from "../modules/lifeops/permissions/ContactTypePermissions.js";
import {CompanyTypePermissions} from "../modules/lifeops/permissions/CompanyTypePermissions.js";
import {ClientTypePermissions} from "../modules/lifeops/permissions/ClientTypePermissions.js";
import {AgentJobPermissions} from "../modules/lifeops/permissions/AgentJobPermissions.js";
import {AgentJobExecutionPermissions} from "../modules/lifeops/permissions/AgentJobExecutionPermissions.js";
import {GoogleConnectionPermissions} from "../modules/google/permissions/GoogleConnectionPermissions.js";


function InitializePermissions() {

    //Merge All Permissions
    const permissions = [
        ...Object.values(UserPermissions),
        ...Object.values(RolePermissions),
        ...Object.values(TenantPermissions),
        ...Object.values(UserApiKeyPermissions),
        ...Object.values(UserLoginFailPermissions),
        ...Object.values(UserSessionPermissions),
        ...Object.values(MediaPermissions),
        ...Object.values(FilePermissions),
        ...Object.values(SettingPermissions),
        ...Object.values(DashboardPermissions),
        ...Object.values(AuditPermissions),
        ...Object.values(AILogPermissions),
        ...Object.values(AIPermissions),
        ...Object.values(AgentSessionPermissions),
        ...Object.values(AgentPermissions),

        ...Object.values(CrudSavedQueryPermissions),

        //Local modules permissions
        ...Object.values(BasePermissions),
        ...Object.values(NotificationPermissions),
        ...Object.values(GoalPermissions),
        ...Object.values(ProjectPermissions),
        ...Object.values(ClientPermissions),
        ...Object.values(ContactPermissions),
        ...Object.values(CompanyPermissions),
        ...Object.values(TaskTypePermissions),
        ...Object.values(TaskStatusPermissions),
        ...Object.values(TaskSourcePermissions),
        ...Object.values(TaskPermissions),
        ...Object.values(PriorityPermissions),
        ...Object.values(ContactTypePermissions),
        ...Object.values(CompanyTypePermissions),
        ...Object.values(ClientTypePermissions),
        ...Object.values(AgentJobPermissions),
        ...Object.values(AgentJobExecutionPermissions),
        ...Object.values(GoogleConnectionPermissions),

    ]

    //Load All Permissions
    LoadPermissions(permissions)
}

export default InitializePermissions

export {InitializePermissions}
