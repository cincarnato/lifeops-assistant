import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "Contact",
    apiBasePath: "contacts",
    apiTag: "Contact",
    collectionName: "Contact",
    schema: {
        firstName: {
            type: "string",
            required: true,
            search: true,
            header: true,
        },
        lastName: {
            type: "string",
            search: true,
            header: true,
        },
        displayName: {
            type: "string",
            required: true,
            search: true,
            header: true,
            index: true,
        },
        type: {
            type: "enum",
            enum: ["work", "client", "provider", "partner", "personal", "internal"],
            default: "work",
            index: true,
            header: true,
        },
        status: {
            type: "enum",
            enum: ["active", "inactive", "archived"],
            default: "active",
            index: true,
            header: true,
        },
        priority: {
            type: "string",
            index: true,
            header: true,
        },
        client: {
            type: "ref",
            ref: "Client",
            refDisplay: "name",
            index: true,
            header: true,
        },
        company: {
            type: "ref",
            ref: "Company",
            refDisplay: "name",
            required: true,
            index: true,
            header: true,
        },
        jobTitle: {
            type: "string",
            search: true,
        },
        department: {
            type: "string",
            search: true,
        },
        emails: {
            type: "array.string",
            default: [],
            index: true,
        },
        phones: {
            type: "array.string",
            default: [],
        },
        valueScore: {
            type: "number",
        },
        relationshipScore: {
            type: "number",
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
