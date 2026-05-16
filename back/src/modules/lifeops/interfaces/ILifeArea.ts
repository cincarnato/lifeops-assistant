
interface ILifeAreaBase {
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

interface ILifeArea {
    _id: string
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
ILifeAreaBase, 
ILifeArea
}
