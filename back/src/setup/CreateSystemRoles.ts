import {CreateOrUpdateRole} from "@drax/identity-back";
import colaboradorRole from "./data/roles/colaborador-role.js";
import principalRole from "./data/roles/principal-role.js";

async function CreateSystemRoles(){
    // Drax resolves child role names to IDs and mutates the supplied array.
    for (const role of [colaboradorRole, principalRole]) {
        await CreateOrUpdateRole({...role, permissions: [...role.permissions], childRoles: [...role.childRoles]})
    }
}

export default CreateSystemRoles

export {
    CreateSystemRoles
}
