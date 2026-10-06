import {describe, expect, it} from "vitest"
import {AgentJobScheduleCalculator} from "../../../../src/modules/lifeops/services/AgentJobScheduleCalculator"
import type {IAgentJob} from "../../../../src/modules/lifeops/interfaces/IAgentJob"

describe("AgentJobScheduleCalculator", () => {
    const calculator = new AgentJobScheduleCalculator()

    it("calculates daily jobs in the configured timezone", () => {
        expect(next({
            type: "daily",
            time: "09:00",
            timezone: "America/New_York"
        }, "2026-01-10T00:00:00.000Z")).toBe("2026-01-10T14:00:00.000Z")
    })

    it("skips missing monthly days instead of rolling to the last day", () => {
        expect(next({
            type: "monthly",
            time: "09:00",
            timezone: "America/Argentina/Buenos_Aires",
            daysOfMonth: [31]
        }, "2026-01-31T13:00:00.000Z")).toBe("2026-03-31T12:00:00.000Z")
    })

    it("calculates cron expressions in the configured timezone", () => {
        expect(next({
            type: "cron",
            timezone: "America/Argentina/Buenos_Aires",
            cronExpression: "0 9 5 * *"
        }, "2026-11-04T20:00:00.000Z")).toBe("2026-11-05T12:00:00.000Z")
    })

    it("supports cron weekday expressions", () => {
        expect(next({
            type: "cron",
            timezone: "America/Argentina/Buenos_Aires",
            cronExpression: "30 8 * * 1"
        }, "2026-10-05T12:00:00.000Z")).toBe("2026-10-12T11:30:00.000Z")
    })

    function next(schedule: IAgentJob["schedule"], from: string): string | undefined {
        return calculator.calculateNextRunAt({schedule}, new Date(from))?.toISOString()
    }
})
