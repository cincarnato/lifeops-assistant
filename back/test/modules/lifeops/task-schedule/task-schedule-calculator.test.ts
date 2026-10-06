import {describe, expect, it} from "vitest"
import {TaskScheduleCalculator} from "../../../../src/modules/lifeops/services/TaskScheduleCalculator"
import type {ITaskScheduleSchedule} from "../../../../src/modules/lifeops/interfaces/ITaskSchedule"

describe("TaskScheduleCalculator", () => {
    const calculator = new TaskScheduleCalculator()

    it("calculates a future once run and does not reschedule completed once schedules", () => {
        const schedule: ITaskScheduleSchedule = {
            type: "once",
            runAt: new Date("2026-11-01T12:00:00.000Z")
        }

        expect(calculator.calculateNextRunAt(schedule, new Date("2026-10-01T00:00:00.000Z"))?.toISOString())
            .toBe("2026-11-01T12:00:00.000Z")
        expect(calculator.calculateNextRunAt(schedule, new Date("2026-11-01T12:00:00.000Z"))).toBeUndefined()
    })

    it("calculates daily runs after the same local time has passed", () => {
        const schedule: ITaskScheduleSchedule = {
            type: "daily",
            time: "09:00",
            timezone: "America/Argentina/Buenos_Aires"
        }

        expect(calculator.calculateNextRunAt(schedule, new Date("2026-10-05T11:00:00.000Z"))?.toISOString())
            .toBe("2026-10-05T12:00:00.000Z")
        expect(calculator.calculateNextRunAt(schedule, new Date("2026-10-05T13:00:00.000Z"))?.toISOString())
            .toBe("2026-10-06T12:00:00.000Z")
    })

    it("interprets daily time in the configured timezone", () => {
        const schedule: ITaskScheduleSchedule = {
            type: "daily",
            time: "09:00",
            timezone: "America/New_York"
        }

        expect(calculator.calculateNextRunAt(schedule, new Date("2026-01-10T00:00:00.000Z"))?.toISOString())
            .toBe("2026-01-10T14:00:00.000Z")
    })

    it("calculates weekly runs for one day, multiple days, and week rollover", () => {
        expect(next({
            type: "weekly",
            time: "09:00",
            timezone: "America/Argentina/Buenos_Aires",
            daysOfWeek: ["monday"]
        }, "2026-10-05T10:00:00.000Z")).toBe("2026-10-05T12:00:00.000Z")

        expect(next({
            type: "weekly",
            time: "09:00",
            timezone: "America/Argentina/Buenos_Aires",
            daysOfWeek: ["monday", "friday"]
        }, "2026-10-05T13:00:00.000Z")).toBe("2026-10-09T12:00:00.000Z")

        expect(next({
            type: "weekly",
            time: "09:00",
            timezone: "America/Argentina/Buenos_Aires",
            daysOfWeek: ["monday"]
        }, "2026-10-05T13:00:00.000Z")).toBe("2026-10-12T12:00:00.000Z")
    })

    it("calculates monthly days and skips missing days", () => {
        const base = {
            type: "monthly" as const,
            time: "09:00",
            timezone: "America/Argentina/Buenos_Aires"
        }

        expect(next({...base, daysOfMonth: [1]}, "2026-01-31T13:00:00.000Z")).toBe("2026-02-01T12:00:00.000Z")
        expect(next({...base, daysOfMonth: [15]}, "2026-01-10T00:00:00.000Z")).toBe("2026-01-15T12:00:00.000Z")
        expect(next({...base, daysOfMonth: [1, 15]}, "2026-01-01T13:00:00.000Z")).toBe("2026-01-15T12:00:00.000Z")
        expect(next({...base, daysOfMonth: [28]}, "2026-02-01T00:00:00.000Z")).toBe("2026-02-28T12:00:00.000Z")
        expect(next({...base, daysOfMonth: [30]}, "2026-02-01T00:00:00.000Z")).toBe("2026-03-30T12:00:00.000Z")
        expect(next({...base, daysOfMonth: [31]}, "2026-01-31T13:00:00.000Z")).toBe("2026-03-31T12:00:00.000Z")
        expect(next({...base, daysOfMonth: [29]}, "2028-02-01T00:00:00.000Z")).toBe("2028-02-29T12:00:00.000Z")
    })

    it("calculates last day of month and monthly intervals", () => {
        const base = {
            type: "monthly" as const,
            time: "09:00",
            timezone: "America/Argentina/Buenos_Aires"
        }

        expect(next({...base, monthlyMode: "lastDayOfMonth"}, "2026-02-01T00:00:00.000Z")).toBe("2026-02-28T12:00:00.000Z")
        expect(next({
            ...base,
            daysOfMonth: [5],
            interval: {every: 3, unit: "months"}
        }, "2026-01-06T00:00:00.000Z")).toBe("2026-04-05T12:00:00.000Z")
    })

    it("calculates yearly runs and year rollover", () => {
        const schedule: ITaskScheduleSchedule = {
            type: "yearly",
            monthsOfYear: [3],
            daysOfMonth: [10],
            time: "09:00",
            timezone: "America/Argentina/Buenos_Aires"
        }

        expect(next(schedule, "2026-03-01T00:00:00.000Z")).toBe("2026-03-10T12:00:00.000Z")
        expect(next(schedule, "2026-03-10T13:00:00.000Z")).toBe("2027-03-10T12:00:00.000Z")
    })

    it("calculates due dates with calendar arithmetic", () => {
        expect(calculator.calculateDueDate({type: "sameDay"}, new Date("2026-11-01T12:00:00.000Z"), "America/Argentina/Buenos_Aires")?.toISOString())
            .toBe("2026-11-01T12:00:00.000Z")
        expect(calculator.calculateDueDate({type: "daysAfter", daysAfter: 9}, new Date("2026-11-01T12:00:00.000Z"), "America/Argentina/Buenos_Aires")?.toISOString())
            .toBe("2026-11-10T12:00:00.000Z")
        expect(calculator.calculateDueDate({type: "daysAfter", daysAfter: 5}, new Date("2026-12-29T12:00:00.000Z"), "America/Argentina/Buenos_Aires")?.toISOString())
            .toBe("2027-01-03T12:00:00.000Z")
    })

    function next(schedule: ITaskScheduleSchedule, from: string): string | undefined {
        return calculator.calculateNextRunAt(schedule, new Date(from))?.toISOString()
    }
})
