
interface IClientBase {
    name: string
    legalName?: string
    taxCondition?: string
    taxIdType?: string
    taxIdNumber?: string
    taxAddress?: string
    taxEmail?: string
    description?: string
    roles: Array<string>
    priority?: string
    website?: string
    aliases?: Array<string>
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
    legalName?: string
    taxCondition?: string
    taxIdType?: string
    taxIdNumber?: string
    taxAddress?: string
    taxEmail?: string
    description?: string
    roles: Array<string>
    priority?: string
    website?: string
    aliases?: Array<string>
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
