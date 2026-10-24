import lifeopsGooglePermissions from "./lifeops-google-permissions.js";

const role = {
    name: "Colaborador",
    permissions: [...lifeopsGooglePermissions],
    childRoles: [],
    readonly: true,
};

export default role;
