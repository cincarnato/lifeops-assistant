import {z} from 'zod';


const ProjectBaseSchema = z.object({
    name: z.string().min(1, 'validation.required'),
    description: z.string().optional().default(""),
    priority: z.string().optional().default(""),
    businessPartner: z.coerce.string().optional().nullable().default(null),
    valueScore: z.number().nullable().optional().default(5),
    motivationScore: z.number().nullable().optional().default(5),
    effortScore: z.number().nullable().optional().default(5),
    redmineProjectId: z.string().optional(),
    aliases: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    user: z.coerce.string().min(1, 'validation.required'),
    archivedAt: z.coerce.date().nullable().optional()
});

const ProjectSchema = ProjectBaseSchema
    .extend({
        _id: z.coerce.string(),
        businessPartner: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
        user: z.object({_id: z.coerce.string(), username: z.string()}),
        createdAt: z.coerce.date().nullable().optional(),
        updatedAt: z.coerce.date().nullable().optional(),
    })

export default ProjectSchema;
export {ProjectSchema, ProjectBaseSchema}
