import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "AgentJob",
    apiBasePath: "agent-jobs",
    apiTag: "AgentJob",
    collectionName: "AgentJob",
    tabs: ["GENERAL", "AGENT", "SCHEDULE", "EXECUTION", "RUNTIME"],
    schema: {
        name: {
            type: "string",
            required: true,
            search: true,
            header: true,
            index: true,
            groupTab: "GENERAL",
        },
        description: {
            type: "longString",
            search: true,
            groupTab: "GENERAL",
        },
        active: {
            type: "boolean",
            default: true,
            index: true,
            header: true,
            groupTab: "GENERAL",
        },
        agent: {
            type: "object",
            required: true,
            groupTab: "AGENT",
            schema: {
                systemPrompt: {
                    type: "longString",
                    required: true,
                },
                allowedTools: {
                    type: "array.string",
                    default: [],
                },
            },
        },
        schedule: {
            type: "object",
            required: true,
            groupTab: "SCHEDULE",
            schema: {
                type: {
                    type: "enum",
                    enum: ["once", "daily", "weekly", "monthly", "interval", "cron"],
                    required: true,
                },
                timezone: {
                    type: "string",
                    required: true,
                    default: "America/Argentina/Buenos_Aires",
                },
                runAt: {
                    type: "date",
                },
                time: {
                    type: "string",
                },
                daysOfWeek: {
                    type: "array.enum",
                    enum: [
                        "monday",
                        "tuesday",
                        "wednesday",
                        "thursday",
                        "friday",
                        "saturday",
                        "sunday",
                    ],
                },
                daysOfMonth: {
                    type: "array.number",
                },
                interval: {
                    type: "object",
                    schema: {
                        every: {
                            type: "number",
                        },
                        unit: {
                            type: "enum",
                            enum: ["minutes", "hours", "days"],
                        },
                    },
                },
                cronExpression: {
                    type: "string",
                },
            },
        },
        execution: {
            type: "object",
            groupTab: "EXECUTION",
            schema: {
                timeoutSeconds: {
                    type: "number",
                    default: 300,
                },
                maxRetries: {
                    type: "number",
                    default: 0,
                },
            },
        },
        runtime: {
            type: "object",
            groupTab: "RUNTIME",
            schema: {
                lastRunAt: {
                    type: "date",
                },
                nextRunAt: {
                    type: "date",
                    index: true,
                },
                lastStatus: {
                    type: "enum",
                    enum: ["success", "failed", "timeout"],
                },
            },
        },
        createdBy: {
            type: "ref",
            ref: "User",
            refDisplay: "username",
            index: true,
            groupTab: "GENERAL",
        },
    },
};

export default entitySchema;
export { entitySchema };
