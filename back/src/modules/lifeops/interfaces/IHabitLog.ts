
interface IHabitLogBase {
    habit: any
    date: Date
    task?: any
    createdAt?: Date
    updatedAt?: Date
}

interface IHabitLog {
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
