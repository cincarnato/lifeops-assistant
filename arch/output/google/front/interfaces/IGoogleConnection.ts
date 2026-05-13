
interface IGoogleConnectionBase {
    userId: any
    provider: string
    googleEmail: string
    googleUserId: string
    accessToken?: string
    refreshToken: string
    scope: Array<string>
    expiryDate: Date
    status: string
    lastUsedAt?: Date
    connectedAt: Date
    createdAt?: Date
    updatedAt?: Date
}

interface IGoogleConnection {
    _id: string
    userId: any
    provider: string
    googleEmail: string
    googleUserId: string
    accessToken?: string
    refreshToken: string
    scope: Array<string>
    expiryDate: Date
    status: string
    lastUsedAt?: Date
    connectedAt: Date
    createdAt?: Date
    updatedAt?: Date
}

export type {
IGoogleConnectionBase, 
IGoogleConnection
}
