type ProjectImportance = 'HIGH' | 'MEDIUM' | 'LOW'

interface IProjectBase {
    name: string
    description?: string
    priority?: string
    goals?: Array<any>
    redmineProjectId?: string
    businessPartner?: any
    importance?: ProjectImportance | null
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
    redmineProjectId?: string
    businessPartner?: any
    importance?: ProjectImportance | null
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
