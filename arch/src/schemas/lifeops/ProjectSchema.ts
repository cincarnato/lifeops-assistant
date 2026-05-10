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
        goals: {
            type: "array.ref",
            ref: "Goal",
            refDisplay: "name",
            default: [],
            index: true,
        },
        client: {
            type: "ref",
            ref: "Client",
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
        priorityScore: {
            type: "number",
            index: true,
            header: true,
        },
        startDate: {
            type: "date",
        },
        targetDate: {
            type: "date",
            index: true,
            header: true,
        },
        completedAt: {
            type: "date",
        },
        progressPercent: {
            type: "number",
            default: 0,
            header: true,
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
