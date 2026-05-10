import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "Goal",
    apiBasePath: "goals",
    apiTag: "Goal",
    collectionName: "Goal",
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
            enum: ["draft", "active", "paused", "completed", "cancelled", "archived"],
            default: "draft",
            index: true,
            header: true,
        },
        priority: {
            type: "enum",
            enum: ["low", "medium", "high", "critical"],
            default: "medium",
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
        timeHorizon: {
            type: "enum",
            enum: ["short_term", "medium_term", "long_term"],
            default: "medium_term",
            index: true,
            header: true,
        },
        targetDate: {
            type: "date",
            index: true,
            header: true,
        },
        completedAt: {
            type: "date",
        },
        archivedAt: {
            type: "date",
        },
        progressPercent: {
            type: "number",
            default: 0,
            header: true,
        },
        successCriteria: {
            type: "longString",
        },
        purpose: {
            type: "longString",
        },
        constraints: {
            type: "array.string",
            default: [],
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
    },
};

export default entitySchema;
export { entitySchema };
