import {z} from 'zod';


const HabitBaseSchema = z.object({
    tenant: z.string().nullable().optional(),
    name: z.string().min(1, 'validation.required'),
    description: z.string().optional().default(""),
    lifeArea: z.string().optional().default(""),
    active: z.boolean().optional().default(true),
    frequency: z.object({type: z.enum(['daily', 'weekly', 'monthly'])}),
    generateTask: z.boolean().optional().default(false),
    taskTemplate: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        estimatedMinutes: z.number().nullable().optional(),
        priority: z.string().optional()
    }).nullable().default({"title": "", "description": "", "estimatedMinutes": null, "priority": ""}),
    user: z.coerce.string().min(1, 'validation.required')
});

const HabitSchema = HabitBaseSchema
    .extend({
        _id: z.coerce.string(),
        tenant: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
        user: z.object({_id: z.coerce.string(), username: z.string()}),
        createdAt: z.coerce.date().nullable().optional(),
        updatedAt: z.coerce.date().nullable().optional(),
    })

export default HabitSchema;
export {HabitSchema, HabitBaseSchema}
