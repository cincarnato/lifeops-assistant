
import ContactServiceFactory from "../factory/services/ContactServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import ContactPermissions from "../permissions/ContactPermissions.js";
import type {IContact, IContactBase} from "../interfaces/IContact";
import type {FastifyReply} from "fastify";
import type {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import {NotFoundError} from "@drax/common-back";

class ContactController extends AbstractFastifyController<IContact, IContactBase, IContactBase>   {

    constructor() {
        super(ContactServiceFactory.instance, ContactPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

    async syncGoogle(request: CustomRequest, reply: FastifyReply) {
        try {
            this.assertUpdatePermission(request)
            if (!request.params.id) {
                return reply.status(400).send({error: 'BAD REQUEST'})
            }

            const contact = await ContactServiceFactory.instance.findById(request.params.id)
            if (!contact) {
                throw new NotFoundError()
            }

            if (!request.rbac.hasSomePermission([(this.permission as any).All, (this.permission as any).UpdateAll])) {
                this.assertUser(contact, request.rbac)
            }
            this.assertTenant(contact, request.rbac)

            return reply.send(await ContactServiceFactory.instance.syncContactToGoogle(request.params.id))
        } catch (e) {
            this.handleError(e, reply)
        }
    }

}

export default ContactController;
export {
    ContactController
}
