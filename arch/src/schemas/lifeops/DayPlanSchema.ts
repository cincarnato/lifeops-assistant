import { IEntitySchema } from "@drax/arch";

const decisionValues = [
    "PENDIENTE",
    "COMPROMETIDO",
    "DESEABLE",
    "DESCARTADO",
];

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "DayPlan",
    apiBasePath: "day-plans",
    apiTag: "DayPlan",
    collectionName: "DayPlan",
    schema: {
        date: {
            type: "date",
            required: true,
            index: true,
            header: true,
        },
        user: {
            type: "ref",
            ref: "User",
            refDisplay: "username",
            required: true,
            index: true,
            header: true,
        },
        status: {
            type: "enum",
            enum: ["BORRADOR", "VISTO", "CONFIRMADO", "CERRADO"],
            default: "BORRADOR",
            required: true,
            index: true,
            header: true,
        },
        events: {
            type: "array.object",
            default: [],
            schema: {
                googleEventId: {
                    type: "string",
                    required: true,
                    index: true,
                },
                title: {
                    type: "string",
                    required: true,
                    search: true,
                },
                description: {
                    type: "longString",
                    search: true,
                },
                startAt: {
                    type: "date",
                    required: true,
                    index: true,
                },
                endAt: {
                    type: "date",
                },
                decision: {
                    type: "enum",
                    enum: decisionValues,
                    default: "PENDIENTE",
                },
            },
        },
        tasks: {
            type: "array.object",
            default: [],
            schema: {
                task: {
                    type: "ref",
                    ref: "Task",
                    refDisplay: "title",
                    required: true,
                    index: true,
                },
                decision: {
                    type: "enum",
                    enum: decisionValues,
                    default: "PENDIENTE",
                },
            },
        },
        habits: {
            type: "array.object",
            default: [],
            schema: {
                habit: {
                    type: "ref",
                    ref: "Habit",
                    refDisplay: "name",
                    required: true,
                    index: true,
                },
                decision: {
                    type: "enum",
                    enum: decisionValues,
                    default: "PENDIENTE",
                },
            },
        },
        suggestions: {
            type: "array.object",
            default: [],
            schema: {
                title: {
                    type: "string",
                    required: true,
                    search: true,
                },
                decision: {
                    type: "enum",
                    enum: decisionValues,
                    default: "PENDIENTE",
                },
                goal: {
                    type: "ref",
                    ref: "Goal",
                    refDisplay: "name",
                    index: true,
                },
                project: {
                    type: "ref",
                    ref: "Project",
                    refDisplay: "name",
                    index: true,
                },
            },
        },
    },
};

export default entitySchema;
export { entitySchema };
