import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "meta",
    name: "WhatsAppPhoneNumber",
    apiBasePath: "whatsapp-phone-numbers",
    apiTag: "WhatsAppPhoneNumber",
    collectionName: "whatsappPhoneNumbers",
    schema: {
        tenantId: {
            type: "ref",
            ref: "Tenant",
            refDisplay: "name",
            required: true,
            index: true,
            header: true,
        },
        phoneNumberId: {
            type: "string",
            required: true,
            search: true,
            index: true,
            header: true,
        },
        wabaId: {
            type: "string",
            required: true,
            search: true,
            index: true,
            header: true,
        },
        displayPhoneNumber: {
            type: "string",
            required: true,
            search: true,
            header: true,
        },
        enabled: {
            type: "boolean",
            required: true,
            default: true,
            index: true,
            header: true,
        },
    },
};

export default entitySchema;
export { entitySchema };
