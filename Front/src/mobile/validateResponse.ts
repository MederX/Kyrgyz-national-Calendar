import type { CalendarResponse } from '../features/calendar/types/calendar.types';

const eventTypes = new Set(['new_moon', 'full_moon', 'togool', 'nooruz', 'holiday', 'eid_al_fitr', 'ramadan', 'kadyr_tun', 'ai_bashi', 'kurman_ait']);
type RecordValue = Record<string, unknown>;
const record = (value: unknown): value is RecordValue => value !== null && typeof value === 'object' && !Array.isArray(value);
const date = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
const copy = (value: RecordValue) => ['label_ky', 'label_ru', 'description_ky', 'description_ru'].every(key => typeof value[key] === 'string');

/** Validate the fields consumed by the UI before a network response enters the cache. */
export function validateCalendarResponse(value: unknown, requestedYear: number): CalendarResponse {
    const fail = () => { throw new Error('Invalid calendar API response'); };
    if (!record(value) || value.year !== requestedYear || !Array.isArray(value.events) || !Array.isArray(value.periods) || !Array.isArray(value.lunar_months)) return fail();
    for (const event of value.events) {
        if (!record(event) || !date(event.date) || typeof event.time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(event.time) || typeof event.type !== 'string' || !eventTypes.has(event.type) || !copy(event)) return fail();
        if (['tips_ky', 'tips_ru'].some(key => event[key] !== undefined && event[key] !== null && typeof event[key] !== 'string')) return fail();
    }
    for (const period of value.periods) {
        if (!record(period) || period.type !== 'ramadan' || !date(period.start_date) || !date(period.end_date) || period.start_date > period.end_date || !copy(period)) return fail();
    }
    for (const month of value.lunar_months) {
        if (!record(month) || typeof month.name !== 'string' || !month.name.trim() || !date(month.start_date) || !date(month.end_date) || month.start_date > month.end_date || !Number.isInteger(month.days)) return fail();
        const days = (Date.parse(month.end_date) - Date.parse(month.start_date)) / 86_400_000 + 1;
        if (days < 28 || days > 31 || month.days !== days || (month.previous_month_name !== undefined && month.previous_month_name !== null && typeof month.previous_month_name !== 'string')) return fail();
    }
    return value as unknown as CalendarResponse;
}
