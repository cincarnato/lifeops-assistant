
interface ICompanyTypeBase {
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

interface ICompanyType {
    _id: string
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
ICompanyTypeBase, 
ICompanyType
}
