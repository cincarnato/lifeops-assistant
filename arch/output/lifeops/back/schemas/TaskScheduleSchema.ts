
import { z } from 'zod';


const TaskScheduleBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    active: z.boolean().optional(),
    task: z.object({    title: z.string().min(1,'validation.required'),
    description: z.string().optional(),
    source: z.coerce.string().optional().nullable(),
    type: z.coerce.string().optional().nullable(),
    lifeArea: z.coerce.string().optional().nullable(),
    status: z.coerce.string().optional().nullable(),
    priority: z.string().optional(),
    goals: z.array(z.coerce.string()).optional(),
    project: z.coerce.string().optional().nullable(),
    valueScore: z.number().nullable().optional(),
    motivationScore: z.number().nullable().optional(),
    effortScore: z.number().nullable().optional(),
    urgencyScore: z.number().nullable().optional(),
    tags: z.array(z.string()).optional().default([])}),
    schedule: z.object({    type: z.enum(['once', 'interval', 'daily', 'weekly', 'monthly', 'yearly']),
    time: z.string().optional(),
    timezone: z.string().min(1,'validation.required').default('America/Argentina/Buenos_Aires'),
    interval: z.object({    every: z.number().nullable().optional(),
    unit: z.enum(['minutes', 'hours', 'days', 'weeks', 'months']).optional()}),
    daysOfWeek: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional(),
    daysOfMonth: z.array(z.number()).optional(),
    monthsOfYear: z.array(z.number()).optional(),
    runAt: z.coerce.date().nullable().optional(),
    monthlyMode: z.enum(['dayOfMonth', 'lastDayOfMonth']).optional()}),
    dueDateRule: z.object({    type: z.enum(['none', 'sameDay', 'daysAfter']).optional().default('none'),
    daysAfter: z.number().nullable().optional()}),
    runtime: z.object({    lastRunAt: z.coerce.date().nullable().optional(),
    nextRunAt: z.coerce.date().nullable().optional(),
    lastTaskId: z.coerce.string().optional().nullable(),
    lastStatus: z.enum(['success', 'failed']).optional(),
    lastError: z.string().optional()}),
    startAt: z.coerce.date().nullable().optional(),
    endAt: z.coerce.date().nullable().optional(),
    user: z.coerce.string().min(1,'validation.required')
});

const TaskScheduleSchema = TaskScheduleBaseSchema
    .extend({
      _id: z.coerce.string(),
       user: z.object({_id: z.coerce.string(), username: z.string()})
    })

export default TaskScheduleSchema;
export {TaskScheduleSchema, TaskScheduleBaseSchema}
