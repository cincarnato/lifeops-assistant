import LifeAreaPermissions from "../../../modules/lifeops/permissions/LifeAreaPermissions.js";
import MemoryTypePermissions from "../../../modules/lifeops/permissions/MemoryTypePermissions.js";
import TaskTypePermissions from "../../../modules/lifeops/permissions/TaskTypePermissions.js";
import ContactTypePermissions from "../../../modules/lifeops/permissions/ContactTypePermissions.js";
import PriorityPermissions from "../../../modules/lifeops/permissions/PriorityPermissions.js";
import SourcePermissions from "../../../modules/lifeops/permissions/SourcePermissions.js";
import TaskStatusPermissions from "../../../modules/lifeops/permissions/TaskStatusPermissions.js";
import lifeopsGooglePermissions from "./lifeops-google-permissions.js";

const role = {
    name: "Colaborador",
    permissions: [
        ...lifeopsGooglePermissions,
        LifeAreaPermissions.View,
        MemoryTypePermissions.View,
        TaskTypePermissions.View,
        ContactTypePermissions.View,
        PriorityPermissions.View,
        SourcePermissions.View,
        TaskStatusPermissions.View,
    ],
    childRoles: [],
    readonly: true,
};

export default role;
