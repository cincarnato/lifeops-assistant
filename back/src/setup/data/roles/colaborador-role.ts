import PriorityPermissions from "../../../modules/lifeops/permissions/PriorityPermissions.js";
import SourcePermissions from "../../../modules/lifeops/permissions/SourcePermissions.js";
import TaskStatusPermissions from "../../../modules/lifeops/permissions/TaskStatusPermissions.js";
import lifeopsGooglePermissions from "./lifeops-google-permissions.js";

const role = {
    name: "Colaborador",
    permissions: [
        ...lifeopsGooglePermissions,
        PriorityPermissions.View,
        SourcePermissions.View,
        TaskStatusPermissions.View,
    ],
    childRoles: [],
    readonly: true,
};

export default role;
