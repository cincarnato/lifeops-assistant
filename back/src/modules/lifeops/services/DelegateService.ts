import type{IDelegateRepository} from "../interfaces/IDelegateRepository";
import type {IDelegateBase, IDelegate} from "../interfaces/IDelegate";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import ContactServiceFactory from '../factory/services/ContactServiceFactory.js';
import {ValidationError} from '@drax/common-back';

class DelegateService extends AbstractService<IDelegate, IDelegateBase, IDelegateBase> {


    constructor(DelegateRepository: IDelegateRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(DelegateRepository, baseSchema, fullSchema);

        this._validateOutput = true
        this.transformCreate = async data => {
            await this.validateContact(data)
            return {...data, active: data.active ?? true, skills: data.skills ?? []}
        }

    }

    async update(id: string, data: IDelegateBase): Promise<IDelegate> {
        await this.prepareUpdate(id, data)
        return super.update(id, data)
    }

    async updatePartial(id: string, data: IDelegateBase): Promise<IDelegate> {
        await this.prepareUpdate(id, data)
        return super.updatePartial(id, data)
    }

    private async prepareUpdate(id: string, data: IDelegateBase): Promise<void> {
        if (data.contact !== undefined || data.user !== undefined) {
            const previous = await this.findById(id)
            if (previous) {
                await this.validateContact({
                    ...data,
                    contact: data.contact ?? previous.contact?._id,
                    user: data.user ?? previous.user?._id
                })
            }
        }
    }

    private async validateContact(data: IDelegateBase): Promise<void> {
        const contact = await ContactServiceFactory.instance.findById(data.contact)
        if (!contact || String(contact.user?._id ?? contact.user) !== String(data.user?._id ?? data.user)) {
            throw new ValidationError([{field: 'contact', reason: 'delegate.validation.invalidContact'}])
        }
    }

}

export default DelegateService
export {DelegateService}
