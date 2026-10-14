import type {z} from 'zod'
import type {ProjectBaseSchema} from '../schemas/ProjectSchema.js'

type ProjectImportance = z.infer<typeof ProjectBaseSchema.shape.importance>

interface IProjectBase {
    name: string
    description?: string
    priority?: string
    goals?: Array<any>
    businessPartner?: any
    importance?: ProjectImportance
    redmineProjectId?: string
    aliases?: Array<string>
    tags?: Array<string>
    user: any
    archivedAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

interface IProject {
    _id: string
    name: string
    description?: string
    priority?: string
    goals?: Array<any>
    businessPartner?: any
    importance?: ProjectImportance
    redmineProjectId?: string
    aliases?: Array<string>
    tags?: Array<string>
    user: any
    archivedAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

export type {
IProjectBase, 
IProject
}
