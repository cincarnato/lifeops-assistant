import {RoleServiceFactory} from "@drax/identity-back";
import BusinessPartnerServiceFactory from "../../modules/lifeops/factory/services/BusinessPartnerServiceFactory.js";
import ProjectServiceFactory from "../../modules/lifeops/factory/services/ProjectServiceFactory.js";
import ContactServiceFactory from "../../modules/lifeops/factory/services/ContactServiceFactory.js";
import TaskServiceFactory from "../../modules/lifeops/factory/services/TaskServiceFactory.js";

async function MigrateClientToBusinessPartner(): Promise<void> {
    await BusinessPartnerServiceFactory.instance.migrateLegacyClients()
    await ProjectServiceFactory.instance.migrateBusinessPartnerReference()
    await ContactServiceFactory.instance.migrateBusinessPartnerReference()
    await TaskServiceFactory.instance.migrateBusinessPartnerReference()

    const roleService = RoleServiceFactory()
    const roles = await roleService.fetchAll()
    for (const role of roles) {
        if (!role.permissions?.some(permission => permission.startsWith('client:'))) continue

        const permissions = [...new Set(role.permissions.map(permission =>
            permission.replace(/^client:/, 'businesspartner:')
        ))]
        await roleService.updatePartial(role._id, {permissions})
    }
}

export default MigrateClientToBusinessPartner;
export {MigrateClientToBusinessPartner};
