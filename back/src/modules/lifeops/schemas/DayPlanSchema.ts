
import { z } from 'zod';

const DayPlanPrioritySchema = z.enum(['A1', 'A2', 'A3']).nullable().optional();

const DayPlanTasksSchema = z.array(z.object({
    task: z.string().regex(/^[a-f\d]{24}$/i, 'validation.invalid'),
    decision: z.enum(['PENDIENTE', 'COMPROMETIDO', 'DESEABLE', 'DESCARTADO']).optional(),
    priority: DayPlanPrioritySchema,
})).superRefine((tasks, ctx) => {
    if (new Set(tasks.map(item => item.task)).size !== tasks.length) {
        ctx.addIssue({code: 'custom', message: 'dayPlan.tasks.duplicate'});
    }
    const ranks = tasks.flatMap(item => item.priority ? [item.priority] : []);
    if (new Set(ranks).size !== ranks.length) {
        ctx.addIssue({code: 'custom', message: 'dayPlan.priority.duplicate'});
    }
});

const DayPlanDateSchema = z.string().date();
const DayPlanPlanningSchema = z.object({date: DayPlanDateSchema});
const DayPlanUtcOffsetSchema = z.number().int().min(-840).max(840).default(0);
const DayPlanAvailableSlotsSchema = DayPlanPlanningSchema.extend({
    utcOffsetMinutes: z.coerce.number().int().min(-840).max(840).default(0),
});
const DayPlanScheduleTaskSchema = z.object({
    taskId: z.string().regex(/^[a-f\d]{24}$/i),
    startAt: z.string().datetime({offset: true}),
    utcOffsetMinutes: DayPlanUtcOffsetSchema,
});
export const DayPlanProposalsSchema = z.object({mode: z.enum(['more', 'other'])}).strict();

const DayPlanIdSchema = z.object({id: z.string().regex(/^[a-f\d]{24}$/i)});
const DayPlanSlotsSchema = z.object({slots: z.array(z.object({
    startAt: z.string().datetime(), endAt: z.string().datetime(),
}))});

const DayPlanBaseSchema = z.object({
    date: z.coerce.date({error: "validation.date"}),
    user: z.coerce.string().min(1, 'validation.required'),
    status: z.enum(['BORRADOR', 'VISTO', 'CONFIRMADO', 'CERRADO']).default('BORRADOR'),
    events: z.array(
z.object({    googleEventId: z.string().min(1,'validation.required'),
    title: z.string().min(1,'validation.required'),
    description: z.string().optional(),
    startAt: z.coerce.date({error: "validation.date"}),
    endAt: z.coerce.date().nullable().optional(),
    decision: z.enum(['PENDIENTE', 'COMPROMETIDO', 'DESEABLE', 'DESCARTADO']).optional()})
    ).optional(),
    tasks: DayPlanTasksSchema.optional(),
    habits: z.array(
z.object({    habit: z.coerce.string().min(1,'validation.required'),
    decision: z.enum(['PENDIENTE', 'COMPROMETIDO', 'DESEABLE', 'DESCARTADO']).optional()})
    ).optional(),
    suggestions: z.array(
z.object({    title: z.string().min(1,'validation.required'),
    decision: z.enum(['PENDIENTE', 'COMPROMETIDO', 'DESEABLE', 'DESCARTADO']).optional(),
    goal: z.coerce.string().optional().nullable(),
    project: z.coerce.string().optional().nullable()})
    ).optional()
});

const DayPlanPatchSchema = DayPlanBaseSchema.partial().extend({
    status: z.enum(['BORRADOR', 'VISTO', 'CONFIRMADO', 'CERRADO']).optional(),
});

const DayPlanSchema = DayPlanBaseSchema
    .extend({
      _id: z.coerce.string(),
      user: z.object({
          _id: z.coerce.string(),
          username: z.string()
      }),
      tasks: z.array(
          z.object({
              priority: DayPlanPrioritySchema,
              task: z.object({
                  _id: z.coerce.string(),
                  title: z.string().nullish(),
                  description: z.string().nullish(),
                  importance: z.enum(['HIGH', 'MEDIUM', 'LOW']).nullish(),
                  urgent: z.boolean().optional(),
                  calendarEventId: z.string().optional(),
                  scheduledDate: z.coerce.date().nullish(),
                  project: z.object({_id: z.coerce.string(), name: z.string()}).nullish()
              }),
              decision: z.enum(['PENDIENTE', 'COMPROMETIDO', 'DESEABLE', 'DESCARTADO']).optional()
          })
      ).optional(),
      habits: z.array(
          z.object({
              habit: z.object({
                  _id: z.coerce.string(),
                  name: z.string().nullish()
              }),
              decision: z.enum(['PENDIENTE', 'COMPROMETIDO', 'DESEABLE', 'DESCARTADO']).optional()
          })
      ).optional(),
      suggestions: z.array(
          z.object({
              title: z.string().min(1,'validation.required'),
              decision: z.enum(['PENDIENTE', 'COMPROMETIDO', 'DESEABLE', 'DESCARTADO']).optional(),
              goal: z.object({
                  _id: z.coerce.string(),
                  name: z.string().nullish()
              }).optional().nullable(),
              project: z.object({
                  _id: z.coerce.string(),
                  name: z.string().nullish()
              }).optional().nullable()
          })
      ).optional(),
    })

export default DayPlanSchema;
export {DayPlanSchema, DayPlanBaseSchema, DayPlanTasksSchema, DayPlanPlanningSchema,
    DayPlanScheduleTaskSchema, DayPlanAvailableSlotsSchema, DayPlanIdSchema, DayPlanSlotsSchema, DayPlanPatchSchema}
