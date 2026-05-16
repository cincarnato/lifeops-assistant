import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "Habit",
    apiBasePath: "habits",
    apiTag: "Habit",
    collectionName: "Habit",
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
        lifeArea: {
            type: "string",
            search: true,
            header: true,
            index: true,
        },
        active: {
            type: "boolean",
            default: true,
            header: true,
            index: true,
        },
        frequency: {
            type: "object",
            required: true,
            schema: {
                type: {
                    type: "enum",
                    enum: ["daily", "weekly", "monthly"],
                    required: true,
                    header: true,
                    index: true,
                },
            },
        },
        generateTask: {
            type: "boolean",
            default: false,
            header: true,
        },
        taskTemplate: {
            type: "object",
            schema: {
                title: {
                    type: "string",
                    search: true,
                },
                description: {
                    type: "longString",
                },
                estimatedMinutes: {
                    type: "number",
                },
                priority: {
                    type: "string",
                },
            },
        },
    },
};

export default entitySchema;
export { entitySchema };
