import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "AgentJobExecution",
    apiBasePath: "agent-job-executions",
    apiTag: "AgentJobExecution",
    collectionName: "AgentJobExecution",
    tabs: ["GENERAL", "TIMING", "PROMPT", "RESULT", "TOOLS", "ERROR", "USAGE"],
    schema: {
        jobId: {
            type: "ref",
            ref: "AgentJob",
            refDisplay: "name",
            required: true,
            index: true,
            header: true,
            groupTab: "GENERAL",
        },
        status: {
            type: "enum",
            enum: ["pending", "running", "success", "failed", "timeout"],
            required: true,
            index: true,
            header: true,
            groupTab: "GENERAL",
        },
        trigger: {
            type: "enum",
            enum: ["scheduled", "manual", "retry"],
            required: true,
            default: "scheduled",
            header: true,
            groupTab: "GENERAL",
        },
        scheduledFor: {
            type: "date",
            index: true,
            header: true,
            groupTab: "TIMING",
        },
        startedAt: {
            type: "date",
            header: true,
            groupTab: "TIMING",
        },
        finishedAt: {
            type: "date",
            groupTab: "TIMING",
        },
        durationMs: {
            type: "number",
            groupTab: "TIMING",
        },
        attempt: {
            type: "number",
            default: 1,
            header: true,
            groupTab: "GENERAL",
        },
        promptSnapshot: {
            type: "object",
            groupTab: "PROMPT",
            schema: {
                systemPrompt: {
                    type: "longString",
                },
                allowedTools: {
                    type: "array.string",
                    default: [],
                },
            },
        },
        result: {
            type: "object",
            groupTab: "RESULT",
            schema: {
                summary: {
                    type: "longString",
                },
                actions: {
                    type: "array.object",
                    default: [],
                    schema: {
                        type: {
                            type: "string",
                            required: true,
                        },
                        description: {
                            type: "longString",
                        },
                        entityType: {
                            type: "string",
                        },
                        entityId: {
                            type: "string",
                        },
                        status: {
                            type: "enum",
                            enum: ["success", "failed"],
                            default: "success",
                        },
                    },
                },
                data: {
                    type: "record",
                    schema: {},
                },
                outcome: {
                    type: "string",
                },
            },
        },
        toolCalls: {
            type: "array.object",
            default: [],
            groupTab: "TOOLS",
            schema: {
                name: {
                    type: "string",
                    required: true,
                },
                status: {
                    type: "enum",
                    enum: ["success", "failed"],
                    required: true,
                },
                input: {
                    type: "record",
                    schema: {},
                },
                output: {
                    type: "record",
                    schema: {},
                },
                errorMessage: {
                    type: "longString",
                },
                durationMs: {
                    type: "number",
                },
            },
        },
        error: {
            type: "object",
            groupTab: "ERROR",
            schema: {
                code: {
                    type: "string",
                },
                message: {
                    type: "longString",
                },
            },
        },
        usage: {
            type: "object",
            groupTab: "USAGE",
            schema: {
                model: {
                    type: "string",
                },
                inputTokens: {
                    type: "number",
                },
                outputTokens: {
                    type: "number",
                },
                totalTokens: {
                    type: "number",
                },
            },
        },
    },
};

export default entitySchema;
export { entitySchema };
