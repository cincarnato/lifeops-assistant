
interface IDayPlanBase {
    tenant?: any
    date: Date
    user: any
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
    priority?: 'A1' | 'A2' | 'A3' | null
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
    tenant?: any
    _id: string
    date: Date
    user: any
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
    priority?: 'A1' | 'A2' | 'A3' | null
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
