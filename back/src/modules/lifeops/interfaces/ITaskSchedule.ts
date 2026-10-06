
type TaskScheduleType = "once" | "interval" | "daily" | "weekly" | "monthly" | "yearly"
type TaskScheduleIntervalUnit = "minutes" | "hours" | "days" | "weeks" | "months"
type TaskScheduleWeekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
type TaskScheduleMonthlyMode = "dayOfMonth" | "lastDayOfMonth"
type TaskScheduleDueDateRuleType = "none" | "sameDay" | "daysAfter"
type TaskScheduleRuntimeStatus = "success" | "failed"

interface ITaskScheduleTaskTemplate {
    title: string
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
    tags?: Array<string>
}

interface ITaskScheduleSchedule {
    type: TaskScheduleType
    time?: string
    timezone?: string
    interval?: {
        every?: number
        unit?: TaskScheduleIntervalUnit
    }
    daysOfWeek?: Array<TaskScheduleWeekday>
    daysOfMonth?: Array<number>
    monthsOfYear?: Array<number>
    runAt?: Date
    monthlyMode?: TaskScheduleMonthlyMode
}

interface ITaskScheduleDueDateRule {
    type?: TaskScheduleDueDateRuleType
    daysAfter?: number
}

interface ITaskScheduleRuntime {
    lastRunAt?: Date
    nextRunAt?: Date
    lastTaskId?: any
    lastStatus?: TaskScheduleRuntimeStatus
    lastError?: string
}

interface ITaskScheduleBase {
    name: string
    active?: boolean
    task: ITaskScheduleTaskTemplate
    schedule: ITaskScheduleSchedule
    dueDateRule?: ITaskScheduleDueDateRule
    runtime?: ITaskScheduleRuntime
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
    task: ITaskScheduleTaskTemplate
    schedule: ITaskScheduleSchedule
    dueDateRule?: ITaskScheduleDueDateRule
    runtime?: ITaskScheduleRuntime
    startAt?: Date
    endAt?: Date
    user: any
    createdAt?: Date
    updatedAt?: Date
}

export type {
ITaskScheduleBase,
ITaskSchedule,
ITaskScheduleTaskTemplate,
ITaskScheduleSchedule,
ITaskScheduleDueDateRule,
ITaskScheduleRuntime
}
