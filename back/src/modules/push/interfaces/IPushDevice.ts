
interface IPushDeviceBase {
    user?: any
    isGuest?: boolean
    guestLabel?: string
    platform: string
    token: string
    deviceName?: string
    enabled: boolean
    lastSeenAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

interface IPushDevice {
    _id: string
    user?: any
    isGuest?: boolean
    guestLabel?: string
    platform: string
    token: string
    deviceName?: string
    enabled: boolean
    lastSeenAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

export type {
IPushDeviceBase, 
IPushDevice
}
