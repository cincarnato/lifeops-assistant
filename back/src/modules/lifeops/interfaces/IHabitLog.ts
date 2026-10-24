
interface IHabitLogBase {
    tenant?: any
    habit: any
    date: Date
    task?: any
    createdAt?: Date
    updatedAt?: Date
}

interface IHabitLog {
    tenant?: any
    _id: string
    habit: any
    date: Date
    task?: any
    createdAt?: Date
    updatedAt?: Date
}

export type {
IHabitLogBase, 
IHabitLog
}
