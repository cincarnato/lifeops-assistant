
interface IClientBase {
    name: string
    description?: string
    type?: string
    status?: string
    priority?: string
    valueScore?: number
    relationshipScore?: number
    priorityScore?: number
    website?: string
    emailDomains?: Array<string>
    company: any
    mainContact?: any
    redmineProjectIds?: Array<string>
    tags?: Array<string>
    notes?: string
    user: any
    archivedAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

interface IClient {
    _id: string
    name: string
    description?: string
    type?: string
    status?: string
    priority?: string
    valueScore?: number
    relationshipScore?: number
    priorityScore?: number
    website?: string
    emailDomains?: Array<string>
    company: any
    mainContact?: any
    redmineProjectIds?: Array<string>
    tags?: Array<string>
    notes?: string
    user: any
    archivedAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

export type {
IClientBase, 
IClient
}
