
interface IShoppingItemBase {
    name: string
    quantity?: string
    purchased?: boolean
    purchasedAt?: Date
    user: any
    createdAt?: Date
    updatedAt?: Date
}

interface IShoppingItem {
    _id: string
    name: string
    quantity?: string
    purchased?: boolean
    purchasedAt?: Date
    user: any
    createdAt?: Date
    updatedAt?: Date
}

export type {
IShoppingItemBase,
IShoppingItem
}
