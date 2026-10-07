import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "Client",
    apiBasePath: "clients",
    apiTag: "Client",
    collectionName: "Client",
    schema: {
        name: {
            type: "string",
            required: true,
            search: true,
            header: true,
            index: true,
        },
        legalName: {
            type: "string",
            search: true,
        },
        taxCondition: {
            type: "string",
            search: true,
        },
        taxIdType: {
            type: "string",
            search: true,
        },
        taxIdNumber: {
            type: "string",
            search: true,
        },
        taxAddress: {
            type: "longString",
            search: true,
        },
        taxEmail: {
            type: "string",
            search: true,
        },
        description: {
            type: "longString",
            search: true,
        },
        roles: {
            type: "array.enum",
            enum: ["client", "provider", "prospect", "none"],
            default: ["none"],
            required: true,
            index: true,
            header: true,
        },
        priority: {
            type: "string",
            index: true,
            header: true,
        },
        website: {
            type: "string",
            search: true,
        },
        aliases: {
            type: "array.string",
            default: [],
            index: true,
            search: true,
        },
        mainContact: {
            type: "ref",
            ref: "Contact",
            refDisplay: "displayName",
            index: true,
            header: true,
        },
        redmineProjectIds: {
            type: "array.string",
            default: [],
            index: true,
        },
        tags: {
            type: "array.string",
            default: [],
            index: true,
        },
        notes: {
            type: "longString",
        },
        user: {
            type: "ref",
            ref: "User",
            refDisplay: "username",
            required: true,
            index: true,
            header: true,
        },
        archivedAt: {
            type: "date",
        },
    },
};

export default entitySchema;
export { entitySchema };
