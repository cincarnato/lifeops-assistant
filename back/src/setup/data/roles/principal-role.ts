import {UserPermissions, RolePermissions} from "@drax/identity-back";
import colaboradorRole from "./colaborador-role.js";
import lifeopsGooglePermissions from "./lifeops-google-permissions.js";

const role = {
    name: "Principal",
    permissions: [
        ...lifeopsGooglePermissions,
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
