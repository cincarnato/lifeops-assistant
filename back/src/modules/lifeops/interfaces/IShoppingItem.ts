
interface IShoppingItemBase {
    name: string
    quantity?: string | null
    purchaseLocation?: string | null
    purchased?: boolean
    purchasedAt?: Date | null
    user: any
    createdAt?: Date
    updatedAt?: Date
}

interface IShoppingItem {
    _id: string
    name: string
    quantity?: string | null
    purchaseLocation?: string | null
    purchased?: boolean
    purchasedAt?: Date | null
    user: any
    createdAt?: Date
    updatedAt?: Date
}

export type {
IShoppingItemBase,
IShoppingItem
}
