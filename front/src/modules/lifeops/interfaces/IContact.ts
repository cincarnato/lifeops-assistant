
interface IContactBase {
    firstName: string
    lastName?: string
    displayName: string
    type?: string
    priority?: string
    client?: any
    company: any
    jobTitle?: string
    department?: string
    aliases?: Array<string>
    emails?: Array<string>
    phones?: Array<string>
    valueScore?: number
    relationshipScore?: number
    tags?: Array<string>
    notes?: string
    user: any
    archivedAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

interface IContact {
    _id: string
    firstName: string
    lastName?: string
    displayName: string
    type?: string
    priority?: string
    client?: any
    company: any
    jobTitle?: string
    department?: string
    aliases?: Array<string>
    emails?: Array<string>
    phones?: Array<string>
    valueScore?: number
    relationshipScore?: number
    tags?: Array<string>
    notes?: string
    user: any
    archivedAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

export type {
IContactBase, 
IContact
}
