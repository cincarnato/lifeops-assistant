import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "Task",
    apiBasePath: "tasks",
    apiTag: "Task",
    collectionName: "Task",
    schema: {
        title: {
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
        source: {
            type: "ref",
            ref: "TaskSource",
            refDisplay: "name",
            index: true,
            header: true,
        },
        type: {
            type: "ref",
            ref: "TaskType",
            refDisplay: "name",
            index: true,
            header: true,
        },
        status: {
            type: "ref",
            ref: "TaskStatus",
            refDisplay: "name",
            index: true,
            header: true,
        },
        priority: {
            type: "ref",
            ref: "TaskPriority",
            refDisplay: "name",
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
        project: {
            type: "ref",
            ref: "Project",
            refDisplay: "name",
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
        contacts: {
            type: "array.ref",
            ref: "Contact",
            refDisplay: "displayName",
            default: [],
            index: true,
        },
        valueScore: {
            type: "number",
            default: 5,
            index: true,
            header: true,
        },
        motivationScore: {
            type: "number",
            default: 5,
        },
        effortScore: {
            type: "number",
            default: 5,
        },
        urgencyScore: {
            type: "number",
        },
        dueDate: {
            type: "date",
            index: true,
            header: true,
        },
        scheduledDate: {
            type: "date",
            index: true,
            header: true,
        },
        completedAt: {
            type: "date",
        },
        estimatedMinutes: {
            type: "number",
            default: 1,
        },
        spentMinutes: {
            type: "number",
            default: 1,
        },
        nextAction: {
            type: "string",
            search: true,
        },
        redmineIssueId: {
            type: "string",
            search: true,
            index: true,
        },
        emailMessageId: {
            type: "string",
            search: true,
            index: true,
        },
        calendarEventId: {
            type: "string",
            search: true,
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
