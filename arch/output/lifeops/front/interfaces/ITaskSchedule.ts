
interface ITaskScheduleBase {
    name: string
    active?: boolean
    task: {    title: string
    description?: string
    source?: any
    type?: any
    lifeArea?: any
    status?: any
    priority?: string
    goals?: Array<any>
    project?: any
    valueScore?: number
    motivationScore?: number
    effortScore?: number
    urgencyScore?: number
    tags?: Array<string>}
    schedule: {    type: string
    time?: string
    timezone: string
    interval?: {    every?: number
    unit?: string}
    daysOfWeek?: Array<string>
    daysOfMonth?: Array<number>
    monthsOfYear?: Array<number>
    runAt?: Date
    monthlyMode?: string}
    dueDateRule?: {    type?: string
    daysAfter?: number}
    runtime?: {    lastRunAt?: Date
    nextRunAt?: Date
    lastTaskId?: any
    lastStatus?: string
    lastError?: string}
    startAt?: Date
    endAt?: Date
    user: any
    createdAt?: Date
    updatedAt?: Date
}

interface ITaskSchedule {
    _id: string
    name: string
    active?: boolean
    task: {    title: string
    description?: string
    source?: any
    type?: any
    lifeArea?: any
    status?: any
    priority?: string
    goals?: Array<any>
    project?: any
    valueScore?: number
    motivationScore?: number
    effortScore?: number
    urgencyScore?: number
    tags?: Array<string>}
    schedule: {    type: string
    time?: string
    timezone: string
    interval?: {    every?: number
    unit?: string}
    daysOfWeek?: Array<string>
    daysOfMonth?: Array<number>
    monthsOfYear?: Array<number>
    runAt?: Date
    monthlyMode?: string}
    dueDateRule?: {    type?: string
    daysAfter?: number}
    runtime?: {    lastRunAt?: Date
    nextRunAt?: Date
    lastTaskId?: any
    lastStatus?: string
    lastError?: string}
    startAt?: Date
    endAt?: Date
    user: any
    createdAt?: Date
    updatedAt?: Date
}

export type {
ITaskScheduleBase, 
ITaskSchedule
}
