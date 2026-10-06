import {z} from 'zod';
import {TaskScheduleCalculator} from "../services/TaskScheduleCalculator.js";

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "validation.time.HHMM").optional();
const timezoneSchema = z.string()
    .min(1, 'validation.required')
    .default('America/Argentina/Buenos_Aires')
    .refine(value => new TaskScheduleCalculator().isValidTimezone(value), "validation.timezone.invalid");
const optionalNullableDateSchema = z.preprocess(value => {
    if (value === "" || value === 0 || value === "0") {
        return null;
    }

    if (value instanceof Date && value.getTime() === 0) {
        return null;
    }

    if (typeof value === "string") {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime()) && date.getTime() === 0) {
            return null;
        }
    }

    return value;
}, z.coerce.date().nullable().optional());

const TaskScheduleRawSchema = z.object({
    name: z.string().trim().min(1, 'validation.required'),
    active: z.boolean().optional().default(true),
    task: z.object({
        title: z.string().trim().min(1, 'validation.required'),
        description: z.string().optional(),
        source: z.coerce.string().optional().nullable(),
        type: z.coerce.string().optional().nullable(),
        lifeArea: z.coerce.string().optional().nullable(),
        status: z.coerce.string().optional().nullable(),
        priority: z.string().optional(),
        goals: z.array(z.coerce.string()).optional().default([]),
        project: z.coerce.string().optional().nullable(),
        valueScore: z.coerce.number().nullable().optional(),
        motivationScore: z.coerce.number().nullable().optional(),
        effortScore: z.coerce.number().nullable().optional(),
        urgencyScore: z.coerce.number().nullable().optional(),
        tags: z.array(z.string()).optional().default([])
    }),
    schedule: z.object({
        type: z.enum(['once', 'interval', 'daily', 'weekly', 'monthly', 'yearly']),
        time: timeSchema,
        timezone: timezoneSchema,
        interval: z.object({
            every: z.number().int().min(1).nullable().optional(),
            unit: z.enum(['minutes', 'hours', 'days', 'weeks', 'months']).optional()
        }).optional(),
        daysOfWeek: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional(),
        daysOfMonth: z.array(z.coerce.number().int().min(1).max(31)).optional(),
        monthsOfYear: z.array(z.coerce.number().int().min(1).max(12)).optional(),
        runAt: optionalNullableDateSchema,
        monthlyMode: z.enum(['dayOfMonth', 'lastDayOfMonth']).optional()
    }),
    dueDateRule: z.object({
        type: z.enum(['none', 'sameDay', 'daysAfter']).optional().default('none'),
        daysAfter: z.number().int().min(0).nullable().optional()
    }).optional().default({type: "none"}),
    runtime: z.object({
        lastRunAt: optionalNullableDateSchema,
        nextRunAt: optionalNullableDateSchema,
        lastTaskId: z.coerce.string().optional().nullable(),
        lastStatus: z.enum(['success', 'failed']).optional(),
        lastError: z.string().optional()
    }).optional(),
    startAt: optionalNullableDateSchema,
    endAt: optionalNullableDateSchema,
    user: z.coerce.string().min(1, 'validation.required')
});

function validateTaskSchedule(value: any, context: z.RefinementCtx) {
    const schedule = value.schedule;

    if (value.startAt && value.endAt && value.startAt.getTime() > value.endAt.getTime()) {
        context.addIssue({code: "custom", path: ["endAt"], message: "validation.endAt.afterStartAt"});
    }

    if (schedule.type === "once" && !schedule.runAt) {
        context.addIssue({code: "custom", path: ["schedule", "runAt"], message: "validation.required"});
    }

    if (schedule.type === "interval" && (!schedule.interval?.every || !schedule.interval?.unit)) {
        context.addIssue({code: "custom", path: ["schedule", "interval"], message: "validation.required"});
    }

    if (schedule.type === "weekly" && !schedule.daysOfWeek?.length) {
        context.addIssue({code: "custom", path: ["schedule", "daysOfWeek"], message: "validation.required"});
    }

    if (schedule.type === "monthly" && schedule.monthlyMode !== "lastDayOfMonth" && !schedule.daysOfMonth?.length) {
        context.addIssue({code: "custom", path: ["schedule", "daysOfMonth"], message: "validation.required"});
    }

    if (schedule.type === "yearly") {
        if (!schedule.monthsOfYear?.length) {
            context.addIssue({code: "custom", path: ["schedule", "monthsOfYear"], message: "validation.required"});
        }
        if (!schedule.daysOfMonth?.length) {
            context.addIssue({code: "custom", path: ["schedule", "daysOfMonth"], message: "validation.required"});
        }
    }

    if (value.dueDateRule?.type === "daysAfter" && value.dueDateRule.daysAfter === undefined) {
        context.addIssue({code: "custom", path: ["dueDateRule", "daysAfter"], message: "validation.required"});
    }
}

const TaskScheduleBaseSchema = TaskScheduleRawSchema;

const TaskScheduleSchema = TaskScheduleRawSchema
    .extend({
        _id: z.coerce.string(),
        user: z.object({_id: z.coerce.string(), username: z.string()}),
        task: z.object({
            title: z.string().trim().min(1, 'validation.required'),
            description: z.string().optional(),
            source: z.coerce.string().optional().nullable(),
            type: z.coerce.string().optional().nullable(),
            lifeArea: z.coerce.string().optional().nullable(),
            status: z.coerce.string().optional().nullable(),
            priority: z.string().optional(),
            valueScore: z.number().nullable().optional(),
            motivationScore: z.number().nullable().optional(),
            effortScore: z.number().nullable().optional(),
            urgencyScore: z.number().nullable().optional(),
            tags: z.array(z.string()).optional().default([]),
            goals: z.array(z.object({_id: z.coerce.string(), name: z.string()})).optional(),
            project: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
        }),
        createdAt: z.coerce.date().nullable().optional(),
        updatedAt: z.coerce.date().nullable().optional(),
    })

export default TaskScheduleSchema;
export {TaskScheduleSchema, TaskScheduleBaseSchema, validateTaskSchedule}
