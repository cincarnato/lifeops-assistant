
interface ICompanyBase {
    name: string
    legalName?: string
    taxIdType?: string
    taxIdNumber?: string
    description?: string
    type?: string
    status?: string
    website?: string
    emailDomains?: Array<string>
    tags?: Array<string>
    notes?: string
    user: any
    archivedAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

interface ICompany {
    _id: string
    name: string
    legalName?: string
    taxIdType?: string
    taxIdNumber?: string
    description?: string
    type?: string
    status?: string
    website?: string
    emailDomains?: Array<string>
    tags?: Array<string>
    notes?: string
    user: any
    archivedAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

export type {
ICompanyBase, 
ICompany
}
