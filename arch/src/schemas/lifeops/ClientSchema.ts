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
        description: {
            type: "longString",
            search: true,
        },
        type: {
            type: "string",
            index: true,
            header: true,
        },
        status: {
            type: "enum",
            enum: ["active", "inactive", "prospect", "paused", "archived"],
            default: "active",
            index: true,
            header: true,
        },
        priority: {
            type: "string",
            index: true,
            header: true,
        },
        valueScore: {
            type: "number",
            default: 5,
        },
        relationshipScore: {
            type: "number",
        },
        priorityScore: {
            type: "number",
            index: true,
            header: true,
        },
        website: {
            type: "string",
            search: true,
        },
        emailDomains: {
            type: "array.string",
            default: [],
            index: true,
        },
        company: {
            type: "ref",
            ref: "Company",
            refDisplay: "name",
            required: true,
            index: true,
            header: true,
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
