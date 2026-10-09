
interface IProjectBase {
    name: string
    description?: string
    priority?: string
    redmineProjectId?: string
    businessPartner?: any
    valueScore?: number
    motivationScore?: number
    effortScore?: number
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
    redmineProjectId?: string
    businessPartner?: any
    valueScore?: number
    motivationScore?: number
    effortScore?: number
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
