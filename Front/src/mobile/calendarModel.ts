import type { CalendarEvent, CalendarResponse, LunarMonth } from '../features/calendar/types/calendar.types';

export const FIRST_YEAR = 1900;
export const LAST_YEAR = 2050;
const DAY = 86_400_000;
const priority: Record<string, number> = { nooruz: 1, togool: 2, new_moon: 3, full_moon: 3, kadyr_tun: 4, ai_bashi: 4, eid_al_fitr: 4, kurman_ait: 4, ramadan: 4, holiday: 5 };

export function getDateInTimeZone(now: Date, timeZone: string): string {
    const parts = new Intl.DateTimeFormat('en', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    const value = (name: string) => parts.find(part => part.type === name)!.value;
    return `${value('year')}-${value('month')}-${value('day')}`;
}

export function parseDate(isoDate: string): Date {
    return new Date(`${isoDate}T00:00:00Z`);
}

export function clampDate(isoDate: string): string {
    return isoDate < '1900-01-01' ? '1900-01-01' : isoDate > '2050-12-31' ? '2050-12-31' : isoDate;
}

export function moveDateByDays(isoDate: string, days: number): string {
    return new Date(parseDate(isoDate).getTime() + days * DAY).toISOString().slice(0, 10);
}

export function shiftCalendarMonth(isoDate: string, delta: number): string {
    const current = parseDate(isoDate);
    const month = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + delta, 1));
    const lastDay = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
    month.setUTCDate(Math.min(current.getUTCDate(), lastDay));
    return clampDate(month.toISOString().slice(0, 10));
}

export function getMonthCells(isoDate: string): Array<string | null> {
    const first = `${isoDate.slice(0, 7)}-01`;
    const offset = (parseDate(first).getUTCDay() + 6) % 7;
    const date = parseDate(first);
    const days = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
    return [...Array<string | null>(offset).fill(null), ...Array.from({ length: days }, (_, day) => moveDateByDays(first, day))];
}

function uniqueEvents(responses: CalendarResponse[]): CalendarEvent[] {
    const events = new Map<string, CalendarEvent>();
    for (const data of responses) {
        for (const event of data.events) events.set(`${event.date}/${event.time}/${event.type}`, event);
    }
    return [...events.values()];
}

export function getDayEvents(responses: CalendarResponse[], isoDate: string): CalendarEvent[] {
    const events = uniqueEvents(responses).filter(event => event.date === isoDate);
    const periods = new Set<string>();
    for (const data of responses) {
        for (const period of data.periods) {
            const key = `${period.type}/${period.start_date}/${period.end_date}`;
            if (periods.has(key) || isoDate < period.start_date || isoDate > period.end_date) continue;
            periods.add(key);
            events.push({ ...period, date: isoDate, time: '' });
        }
    }
    return events.sort((a, b) => (priority[a.type] ?? 9) - (priority[b.type] ?? 9) || a.time.localeCompare(b.time));
}

export function getEventDetailEvents(events: CalendarEvent[], selected: Pick<CalendarEvent, 'date' | 'type' | 'time'>): CalendarEvent[] {
    const event = events.find(event => event.date === selected.date && event.type === selected.type && event.time === selected.time);
    if (!event) return [];
    return [event];
}

export function getLunarMonthForDate(responses: CalendarResponse[], isoDate: string): LunarMonth | null {
    for (const data of responses) {
        const month = data.lunar_months.find(month => month.start_date <= isoDate && month.end_date >= isoDate);
        if (month) return month;
    }
    return null;
}

export function getUpcomingEvent(responses: CalendarResponse[], afterDate: string): CalendarEvent | null {
    const events = uniqueEvents(responses).filter(event => event.date > afterDate);
    for (const data of responses) {
        for (const period of data.periods) {
            if (period.start_date > afterDate) events.push({ ...period, date: period.start_date, time: '' });
        }
    }
    return events.sort((a, b) => a.date.localeCompare(b.date) || (priority[a.type] ?? 9) - (priority[b.type] ?? 9) || a.time.localeCompare(b.time))[0] ?? null;
}

export function getRequiredContext(data: CalendarResponse, isoDate: string, includeUpcoming: boolean): number[] {
    const years = new Set<number>();
    const months = data.lunar_months;
    if (months.length && isoDate < months[0].start_date) years.add(data.year - 1);
    if (months.length && isoDate > months[months.length - 1].end_date) years.add(data.year + 1);
    const visibleMonth = getLunarMonthForDate([data], isoDate);
    if (visibleMonth) {
        years.add(Number(visibleMonth.start_date.slice(0, 4)));
        years.add(Number(visibleMonth.end_date.slice(0, 4)));
    }
    if (includeUpcoming && !getUpcomingEvent([data], isoDate)) years.add(data.year + 1);
    return [...years].filter(year => year !== data.year && year >= FIRST_YEAR && year <= LAST_YEAR).sort();
}

export function getLunarDay(month: LunarMonth, isoDate: string): number {
    return Math.floor((parseDate(isoDate).getTime() - parseDate(month.start_date).getTime()) / DAY) + 1;
}

export function mergeLunarMonths(responses: CalendarResponse[]): LunarMonth[] {
    const months = new Map<string, LunarMonth>();
    responses.forEach(data => data.lunar_months.forEach(month => months.set(month.start_date, month)));
    return [...months.values()].sort((a, b) => a.start_date.localeCompare(b.start_date));
}
