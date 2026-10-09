import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "Project",
    apiBasePath: "projects",
    apiTag: "Project",
    collectionName: "Project",
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
        status: {
            type: "enum",
            enum: ["idea", "active", "paused", "completed", "cancelled", "archived"],
            default: "idea",
            index: true,
            header: true,
        },
        priority: {
            type: "string",
            index: true,
            header: true,
        },
        businessPartner: {
            type: "ref",
            ref: "BusinessPartner",
            refDisplay: "name",
            index: true,
            header: true,
        },
        valueScore: {
            type: "number",
            default: 5,
        },
        motivationScore: {
            type: "number",
            default: 5,
        },
        effortScore: {
            type: "number",
            default: 5,
        },
        redmineProjectId: {
            type: "string",
        },
        tags: {
            type: "array.string",
            default: [],
            index: true,
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
