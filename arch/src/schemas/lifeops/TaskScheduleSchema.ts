import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "TaskSchedule",
    apiBasePath: "task-schedules",
    apiTag: "TaskSchedule",
    collectionName: "TaskSchedule",
    tabs: ["GENERAL", "TASK", "SCHEDULE", "DUE_DATE", "RUNTIME"],
    schema: {
        name: {
            type: "string",
            required: true,
            search: true,
            header: true,
            index: true,
            groupTab: "GENERAL",
        },
        active: {
            type: "boolean",
            default: true,
            index: true,
            header: true,
            groupTab: "GENERAL",
        },
        task: {
            type: "object",
            required: true,
            groupTab: "TASK",
            schema: {
                title: {
                    type: "string",
                    required: true,
                    search: true,
                },
                description: {
                    type: "longString",
                },
                source: {
                    type: "string",
                },
                type: {
                    type: "string",
                },
                lifeArea: {
                    type: "string",
                },
                status: {
                    type: "string",
                },
                priority: {
                    type: "string",
                },
                goals: {
                    type: "array.ref",
                    ref: "Goal",
                    refDisplay: "name",
                    default: [],
                },
                project: {
                    type: "ref",
                    ref: "Project",
                    refDisplay: "name",
                },
                valueScore: {
                    type: "number",
                },
                motivationScore: {
                    type: "number",
                },
                effortScore: {
                    type: "number",
                },
                urgencyScore: {
                    type: "number",
                },
                tags: {
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
                    enum: ["once", "interval", "daily", "weekly", "monthly", "yearly"],
                    required: true,
                },
                time: {
                    type: "string",
                },
                timezone: {
                    type: "string",
                    required: true,
                    default: "America/Argentina/Buenos_Aires",
                },
                interval: {
                    type: "object",
                    schema: {
                        every: {
                            type: "number",
                        },
                        unit: {
                            type: "enum",
                            enum: ["minutes", "hours", "days", "weeks", "months"],
                        },
                    },
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
                monthsOfYear: {
                    type: "array.number",
                },
                runAt: {
                    type: "date",
                },
                monthlyMode: {
                    type: "enum",
                    enum: ["dayOfMonth", "lastDayOfMonth"],
                },
            },
        },
        dueDateRule: {
            type: "object",
            groupTab: "DUE_DATE",
            schema: {
                type: {
                    type: "enum",
                    enum: ["none", "sameDay", "daysAfter"],
                    default: "none",
                },
                daysAfter: {
                    type: "number",
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
                    header: true,
                },
                lastTaskId: {
                    type: "ref",
                    ref: "Task",
                    refDisplay: "title",
                },
                lastStatus: {
                    type: "enum",
                    enum: ["success", "failed"],
                },
                lastError: {
                    type: "longString",
                },
            },
        },
        startAt: {
            type: "date",
            index: true,
            groupTab: "GENERAL",
        },
        endAt: {
            type: "date",
            index: true,
            groupTab: "GENERAL",
        },
        user: {
            type: "ref",
            ref: "User",
            refDisplay: "username",
            required: true,
            index: true,
            header: true,
            groupTab: "GENERAL",
        },
    },
};

export default entitySchema;
export { entitySchema };
