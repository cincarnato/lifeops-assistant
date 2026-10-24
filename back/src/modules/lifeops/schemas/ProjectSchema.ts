import {z} from 'zod';


const ProjectBaseSchema = z.object({
    tenant: z.string().nullable().optional(),
    name: z.string().min(1, 'validation.required'),
    description: z.string().optional().default(""),
    priority: z.string().optional().default(""),
    goals: z.array(z.coerce.string()).optional(),
    businessPartner: z.coerce.string().optional().nullable().default(null),
    importance: z.enum(['HIGH', 'MEDIUM', 'LOW']).nullable().optional(),
    redmineProjectId: z.string().optional(),
    aliases: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    user: z.coerce.string().min(1, 'validation.required'),
    archivedAt: z.coerce.date().nullable().optional()
});

const ProjectSchema = ProjectBaseSchema
    .extend({
        _id: z.coerce.string(),
        tenant: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
        goals: z.array(z.object({_id: z.coerce.string(), name: z.string()})).optional(),
        businessPartner: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
        user: z.object({_id: z.coerce.string(), username: z.string()}),
        createdAt: z.coerce.date().nullable().optional(),
        updatedAt: z.coerce.date().nullable().optional(),
    })

export default ProjectSchema;
export {ProjectSchema, ProjectBaseSchema}
