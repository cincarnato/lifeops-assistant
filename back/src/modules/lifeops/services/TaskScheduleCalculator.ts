import type {
    ITaskScheduleDueDateRule,
    ITaskScheduleSchedule
} from "../interfaces/ITaskSchedule.js";

const DEFAULT_TIMEZONE = "America/Argentina/Buenos_Aires";
const DEFAULT_TIME = "00:00";
const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

interface LocalDateTime {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second?: number;
    millisecond?: number;
}

class TaskScheduleCalculator {
    public static defaultTimezone = DEFAULT_TIMEZONE;

    public calculateNextRunAt(schedule: ITaskScheduleSchedule, from: Date = new Date()): Date | undefined {
        const timezone = this.resolveTimezone(schedule.timezone);

        switch (schedule.type) {
            case "once":
                return this.nextOnceRun(schedule, from);
            case "interval":
                return this.nextIntervalRun(schedule, from, timezone);
            case "daily":
                return this.nextDailyRun(schedule, from, timezone);
            case "weekly":
                return this.nextWeeklyRun(schedule, from, timezone);
            case "monthly":
                return this.nextMonthlyRun(schedule, from, timezone);
            case "yearly":
                return this.nextYearlyRun(schedule, from, timezone);
            default:
                return undefined;
        }
    }

    public calculateDueDate(rule: ITaskScheduleDueDateRule | undefined, scheduledFor: Date, timezone?: string): Date | undefined {
        const type = rule?.type ?? "none";

        if (type === "none") {
            return undefined;
        }

        if (type === "sameDay") {
            return new Date(scheduledFor);
        }

        const daysAfter = rule?.daysAfter ?? 0;
        const local = this.toZonedParts(scheduledFor, this.resolveTimezone(timezone));
        return this.fromZonedParts({
            ...local,
            day: local.day + daysAfter
        }, this.resolveTimezone(timezone));
    }

    public isValidTimezone(timezone: string | undefined): boolean {
        if (!timezone) {
            return false;
        }

        try {
            new Intl.DateTimeFormat("en-US", {timeZone: timezone}).format(new Date());
            return true;
        } catch {
            return false;
        }
    }

    public isValidTime(time: string | undefined): boolean {
        return time === undefined || /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
    }

    private nextOnceRun(schedule: ITaskScheduleSchedule, from: Date): Date | undefined {
        const runAt = this.resolveDate(schedule.runAt);
        return runAt && runAt.getTime() > from.getTime() ? runAt : undefined;
    }

    private nextIntervalRun(schedule: ITaskScheduleSchedule, from: Date, timezone: string): Date | undefined {
        const every = schedule.interval?.every;
        const unit = schedule.interval?.unit;

        if (!every || !unit) {
            return undefined;
        }

        if (unit === "minutes" || unit === "hours") {
            const multiplier = unit === "minutes" ? 60_000 : 3_600_000;
            return new Date(from.getTime() + every * multiplier);
        }

        const local = this.toZonedParts(from, timezone);
        const nextLocal = {...local};

        if (unit === "days") {
            nextLocal.day += every;
        } else if (unit === "weeks") {
            nextLocal.day += every * 7;
        } else if (unit === "months") {
            return this.addCalendarMonthsSkippingInvalid(local, every, timezone);
        }

        return this.fromZonedParts(nextLocal, timezone);
    }

    private nextDailyRun(schedule: ITaskScheduleSchedule, from: Date, timezone: string): Date | undefined {
        const fromLocal = this.toZonedParts(from, timezone);
        const time = this.parseTime(schedule.time);
        let candidate = this.fromZonedParts({
            year: fromLocal.year,
            month: fromLocal.month,
            day: fromLocal.day,
            hour: time.hour,
            minute: time.minute
        }, timezone);

        if (candidate.getTime() <= from.getTime()) {
            candidate = this.fromZonedParts({
                year: fromLocal.year,
                month: fromLocal.month,
                day: fromLocal.day + 1,
                hour: time.hour,
                minute: time.minute
            }, timezone);
        }

        return candidate;
    }

    private nextWeeklyRun(schedule: ITaskScheduleSchedule, from: Date, timezone: string): Date | undefined {
        if (!schedule.daysOfWeek?.length) {
            return undefined;
        }

        const allowedDays = new Set(schedule.daysOfWeek.map(day => WEEKDAYS.indexOf(day)));
        const fromLocal = this.toZonedParts(from, timezone);
        const time = this.parseTime(schedule.time);

        for (let offset = 0; offset <= 7; offset += 1) {
            const candidateLocal = {
                year: fromLocal.year,
                month: fromLocal.month,
                day: fromLocal.day + offset,
                hour: time.hour,
                minute: time.minute
            };
            const candidate = this.fromZonedParts(candidateLocal, timezone);
            const candidateWeekday = this.toZonedParts(candidate, timezone).weekday;

            if (candidateWeekday !== undefined && allowedDays.has(candidateWeekday) && candidate.getTime() > from.getTime()) {
                return candidate;
            }
        }

        return undefined;
    }

    private nextMonthlyRun(schedule: ITaskScheduleSchedule, from: Date, timezone: string): Date | undefined {
        const fromLocal = this.toZonedParts(from, timezone);
        const time = this.parseTime(schedule.time);
        const every = schedule.interval?.unit === "months" ? schedule.interval.every ?? 1 : 1;
        const anchorMonthIndex = fromLocal.year * 12 + fromLocal.month - 1;

        for (let monthOffset = 0; monthOffset <= 60; monthOffset += 1) {
            if (monthOffset % every !== 0) {
                continue;
            }

            const monthStart = this.normalizeYearMonth(fromLocal.year, fromLocal.month + monthOffset);
            const days = this.resolveMonthlyDays(schedule, monthStart.year, monthStart.month);

            for (const day of days) {
                const candidate = this.fromZonedParts({
                    year: monthStart.year,
                    month: monthStart.month,
                    day,
                    hour: time.hour,
                    minute: time.minute
                }, timezone);

                const candidateMonthIndex = monthStart.year * 12 + monthStart.month - 1;
                if ((candidateMonthIndex - anchorMonthIndex) % every === 0 && candidate.getTime() > from.getTime()) {
                    return candidate;
                }
            }
        }

        return undefined;
    }

    private nextYearlyRun(schedule: ITaskScheduleSchedule, from: Date, timezone: string): Date | undefined {
        if (!schedule.monthsOfYear?.length || !schedule.daysOfMonth?.length) {
            return undefined;
        }

        const fromLocal = this.toZonedParts(from, timezone);
        const time = this.parseTime(schedule.time);
        const months = this.uniqueSorted(schedule.monthsOfYear).filter(month => month >= 1 && month <= 12);
        const days = this.uniqueSorted(schedule.daysOfMonth).filter(day => day >= 1 && day <= 31);

        for (let yearOffset = 0; yearOffset <= 10; yearOffset += 1) {
            const year = fromLocal.year + yearOffset;

            for (const month of months) {
                const maxDay = this.daysInMonth(year, month);

                for (const day of days) {
                    if (day > maxDay) {
                        continue;
                    }

                    const candidate = this.fromZonedParts({year, month, day, hour: time.hour, minute: time.minute}, timezone);
                    if (candidate.getTime() > from.getTime()) {
                        return candidate;
                    }
                }
            }
        }

        return undefined;
    }

    private resolveMonthlyDays(schedule: ITaskScheduleSchedule, year: number, month: number): number[] {
        const maxDay = this.daysInMonth(year, month);

        if (schedule.monthlyMode === "lastDayOfMonth") {
            return [maxDay];
        }

        return this.uniqueSorted(schedule.daysOfMonth ?? [])
            .filter(day => day >= 1 && day <= maxDay);
    }

    private addCalendarMonthsSkippingInvalid(local: LocalDateTime, every: number, timezone: string): Date | undefined {
        for (let multiplier = 1; multiplier <= 120; multiplier += 1) {
            const target = this.normalizeYearMonth(local.year, local.month + every * multiplier);
            if (local.day > this.daysInMonth(target.year, target.month)) {
                continue;
            }

            return this.fromZonedParts({
                ...local,
                year: target.year,
                month: target.month
            }, timezone);
        }

        return undefined;
    }

    private parseTime(time: string | undefined): {hour: number; minute: number} {
        const [hour, minute] = (time ?? DEFAULT_TIME).split(":").map(value => Number(value));
        return {
            hour: Number.isFinite(hour) ? hour : 0,
            minute: Number.isFinite(minute) ? minute : 0
        };
    }

    private resolveTimezone(timezone: string | undefined): string {
        return this.isValidTimezone(timezone) ? timezone as string : DEFAULT_TIMEZONE;
    }

    private resolveDate(value: any): Date | undefined {
        if (!value) {
            return undefined;
        }

        const date = value instanceof Date ? value : new Date(value);
        return Number.isNaN(date.getTime()) ? undefined : date;
    }

    private uniqueSorted(values: number[]): number[] {
        return [...new Set(values)].sort((a, b) => a - b);
    }

    private daysInMonth(year: number, month: number): number {
        return new Date(Date.UTC(year, month, 0)).getUTCDate();
    }

    private normalizeYearMonth(year: number, month: number): {year: number; month: number} {
        const date = new Date(Date.UTC(year, month - 1, 1));
        return {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1
        };
    }

    private toZonedParts(date: Date, timezone: string): LocalDateTime & {weekday?: number} {
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h23",
            weekday: "short"
        });
        const parts = formatter.formatToParts(date);
        const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? "0";

        return {
            year: Number(value("year")),
            month: Number(value("month")),
            day: Number(value("day")),
            hour: Number(value("hour")),
            minute: Number(value("minute")),
            second: Number(value("second")),
            millisecond: date.getUTCMilliseconds(),
            weekday: this.resolveWeekday(value("weekday"))
        };
    }

    private fromZonedParts(local: LocalDateTime, timezone: string): Date {
        const normalized = this.normalizeLocalDateTime(local);
        let utcTime = Date.UTC(
            normalized.year,
            normalized.month - 1,
            normalized.day,
            normalized.hour,
            normalized.minute,
            normalized.second ?? 0,
            normalized.millisecond ?? 0
        );

        for (let index = 0; index < 3; index += 1) {
            const offset = this.getTimezoneOffsetMs(new Date(utcTime), timezone);
            utcTime = Date.UTC(
                normalized.year,
                normalized.month - 1,
                normalized.day,
                normalized.hour,
                normalized.minute,
                normalized.second ?? 0,
                normalized.millisecond ?? 0
            ) - offset;
        }

        return new Date(utcTime);
    }

    private normalizeLocalDateTime(local: LocalDateTime): Required<LocalDateTime> {
        const date = new Date(Date.UTC(
            local.year,
            local.month - 1,
            local.day,
            local.hour,
            local.minute,
            local.second ?? 0,
            local.millisecond ?? 0
        ));

        return {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            day: date.getUTCDate(),
            hour: date.getUTCHours(),
            minute: date.getUTCMinutes(),
            second: date.getUTCSeconds(),
            millisecond: date.getUTCMilliseconds()
        };
    }

    private getTimezoneOffsetMs(date: Date, timezone: string): number {
        const parts = this.toZonedParts(date, timezone);
        const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second ?? 0, parts.millisecond ?? 0);
        return asUtc - date.getTime();
    }

    private resolveWeekday(value: string): number | undefined {
        const normalized = value.toLowerCase();
        const weekdays = {
            sun: 0,
            mon: 1,
            tue: 2,
            wed: 3,
            thu: 4,
            fri: 5,
            sat: 6
        };

        return weekdays[normalized as keyof typeof weekdays];
    }
}

export default TaskScheduleCalculator;
export {TaskScheduleCalculator, DEFAULT_TIMEZONE};
