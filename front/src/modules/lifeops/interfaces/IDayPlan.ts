
interface IDayPlanBase {
    date: Date
    status: string
    events?: Array<{
    googleEventId: string
    title: string
    description?: string
    startAt: Date
    endAt?: Date
    decision?: string
    }>
    tasks?: Array<{
    task: any
    decision?: string
    }>
    habits?: Array<{
    habit: any
    decision?: string
    }>
    suggestions?: Array<{
    title: string
    decision?: string
    goal?: any
    project?: any
    }>
    createdAt?: Date
    updatedAt?: Date
}

interface IDayPlan {
    _id: string
    date: Date
    status: string
    events?: Array<{
    googleEventId: string
    title: string
    description?: string
    startAt: Date
    endAt?: Date
    decision?: string
    }>
    tasks?: Array<{
    task: any
    decision?: string
    }>
    habits?: Array<{
    habit: any
    decision?: string
    }>
    suggestions?: Array<{
    title: string
    decision?: string
    goal?: any
    project?: any
    }>
    createdAt?: Date
    updatedAt?: Date
}

export type {
IDayPlanBase, 
IDayPlan
}
