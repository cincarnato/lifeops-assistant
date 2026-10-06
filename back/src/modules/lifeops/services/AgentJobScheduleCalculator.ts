import type {IAgentJob} from "../interfaces/IAgentJob.js";
import {TaskScheduleCalculator} from "./TaskScheduleCalculator.js";
import type {ITaskScheduleSchedule} from "../interfaces/ITaskSchedule.js";

type CronField = Set<number> | null;

class AgentJobScheduleCalculator {
    private readonly calendarCalculator = new TaskScheduleCalculator();

    public calculateNextRunAt(job: Pick<IAgentJob, "schedule">, from: Date): Date | undefined {
        if (job.schedule.type === "cron") {
            return this.nextCronRun(job.schedule.cronExpression, from, job.schedule.timezone);
        }

        return this.calendarCalculator.calculateNextRunAt(this.toTaskSchedule(job.schedule), from);
    }

    private toTaskSchedule(schedule: IAgentJob["schedule"]): ITaskScheduleSchedule {
        return {
            type: schedule.type as ITaskScheduleSchedule["type"],
            timezone: schedule.timezone,
            runAt: schedule.runAt,
            time: schedule.time,
            daysOfWeek: schedule.daysOfWeek as ITaskScheduleSchedule["daysOfWeek"],
            daysOfMonth: schedule.daysOfMonth,
            interval: schedule.interval as ITaskScheduleSchedule["interval"]
        };
    }

    private nextCronRun(expression: string | undefined, from: Date, timezone?: string): Date | undefined {
        const cron = this.parseCron(expression);
        if (!cron) {
            return undefined;
        }

        const timezoneName = this.resolveTimezone(timezone);
        const cursor = new Date(from.getTime() + 60_000);
        cursor.setUTCSeconds(0, 0);

        for (let offset = 0; offset < 366 * 24 * 60; offset += 1) {
            const candidate = new Date(cursor.getTime() + offset * 60_000);
            const parts = this.toZonedParts(candidate, timezoneName);

            if (
                this.matches(cron.minute, parts.minute)
                && this.matches(cron.hour, parts.hour)
                && this.matches(cron.month, parts.month)
                && this.matchesDay(cron.dayOfMonth, cron.dayOfWeek, parts.day, parts.weekday)
            ) {
                return candidate;
            }
        }

        return undefined;
    }

    private parseCron(expression: string | undefined): {
        minute: CronField;
        hour: CronField;
        dayOfMonth: CronField;
        month: CronField;
        dayOfWeek: CronField;
    } | null {
        const parts = expression?.trim().split(/\s+/);
        if (!parts || parts.length !== 5) {
            return null;
        }

        const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

        return {
            minute: this.parseCronField(minute, 0, 59),
            hour: this.parseCronField(hour, 0, 23),
            dayOfMonth: this.parseCronField(dayOfMonth, 1, 31),
            month: this.parseCronField(month, 1, 12),
            dayOfWeek: this.parseCronField(dayOfWeek, 0, 7)
        };
    }

    private parseCronField(value: string, min: number, max: number): CronField {
        if (value === "*") {
            return null;
        }

        const values = new Set<number>();
        for (const part of value.split(",")) {
            const stepParts = part.split("/");
            const rangePart = stepParts[0];
            const step = stepParts[1] ? Number(stepParts[1]) : 1;

            if (!Number.isInteger(step) || step <= 0) {
                return new Set();
            }

            const [startRaw, endRaw] = rangePart.includes("-") ? rangePart.split("-") : [rangePart, rangePart];
            const start = rangePart === "*" ? min : Number(startRaw);
            const end = rangePart === "*" ? max : Number(endRaw);

            if (!Number.isInteger(start) || !Number.isInteger(end) || start < min || end > max || start > end) {
                return new Set();
            }

            for (let number = start; number <= end; number += step) {
                values.add(number === 7 && max === 7 ? 0 : number);
            }
        }

        return values;
    }

    private matches(field: CronField, value: number): boolean {
        return field === null || field.has(value);
    }

    private matchesDay(dayOfMonth: CronField, dayOfWeek: CronField, localDay: number, localWeekday: number): boolean {
        if (dayOfMonth === null && dayOfWeek === null) {
            return true;
        }

        if (dayOfMonth === null) {
            return dayOfWeek?.has(localWeekday) ?? false;
        }

        if (dayOfWeek === null) {
            return dayOfMonth.has(localDay);
        }

        return dayOfMonth.has(localDay) || dayOfWeek.has(localWeekday);
    }

    private resolveTimezone(timezone: string | undefined): string {
        return this.calendarCalculator.isValidTimezone(timezone) ? timezone as string : TaskScheduleCalculator.defaultTimezone;
    }

    private toZonedParts(date: Date, timezone: string): {month: number; day: number; hour: number; minute: number; weekday: number} {
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
            weekday: "short"
        });
        const parts = formatter.formatToParts(date);
        const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? "0";

        return {
            month: Number(value("month")),
            day: Number(value("day")),
            hour: Number(value("hour")),
            minute: Number(value("minute")),
            weekday: this.resolveWeekday(value("weekday"))
        };
    }

    private resolveWeekday(value: string): number {
        return {
            sun: 0,
            mon: 1,
            tue: 2,
            wed: 3,
            thu: 4,
            fri: 5,
            sat: 6
        }[value.toLowerCase()] ?? -1;
    }
}

export default AgentJobScheduleCalculator;
export {AgentJobScheduleCalculator};
