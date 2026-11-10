import test from 'node:test';
import assert from 'node:assert/strict';
import { getDateInTimeZone, shiftCalendarMonth, getDayEvents, getEventDetailEvents, getLunarMonthForDate, getUpcomingEvent, getRequiredContext, getMonthCells, moveDateByDays } from './calendarModel.ts';

const event = (date, type = 'new_moon', time = '18:01') => ({ date, type, time, label_ky: type, label_ru: type, description_ky: '', description_ru: '' });
const response = (overrides = {}) => ({ year: 2026, month: null, events: [], periods: [], lunar_months: [], ...overrides });
const lunar = (start_date, end_date, name = 'Жалган куран') => ({ start_date, end_date, name, days: 30 });

test('each coincident event opens only its own details', () => {
    const togool = event('2026-11-24', 'togool', '14:00');
    const fullMoon = event('2026-11-24', 'full_moon', '20:00');
    assert.deepEqual(getEventDetailEvents([togool, fullMoon], togool), [togool]);
    assert.deepEqual(getEventDetailEvents([togool, fullMoon], fullMoon), [fullMoon]);
});

test('selection matches date, type and time and uses refreshed event copy', () => {
    const selected = event('2026-11-24', 'togool', '14:00');
    const refreshed = { ...selected, description_ky: 'Жаңыланган маалымат' };
    const events = [event('2026-11-23', 'togool', '14:00'), event('2026-11-24', 'togool', '21:00'), refreshed];
    assert.deepEqual(getEventDetailEvents(events, selected), [refreshed]);
    assert.deepEqual(getEventDetailEvents(events, event('2026-11-25', 'togool', '14:00')), []);
});

test('Muchol, new moon and Ai bashy each have independent details', () => {
    const moon = event('2026-02-17');
    const note = event('2026-02-17', 'ai_bashi', '00:00');
    const muchol = event('2026-02-17', 'nooruz');
    const events = [muchol, moon, note, event('2026-03-19', 'ai_bashi')];
    assert.deepEqual(getEventDetailEvents(events, moon), [moon]);
    assert.deepEqual(getEventDetailEvents(events, note), [note]);
    assert.deepEqual(getEventDetailEvents(events, muchol), [muchol]);
});

test('current day uses the chosen timezone rather than the device date', () => {
    const now = new Date('2026-12-31T20:00:00Z');
    assert.equal(getDateInTimeZone(now, 'Asia/Bishkek'), '2027-01-01');
    assert.equal(getDateInTimeZone(now, 'America/New_York'), '2026-12-31');
});
test('month navigation clamps leap days and stops at supported year boundaries', () => {
    assert.equal(shiftCalendarMonth('2024-01-31', 1), '2024-02-29');
    assert.equal(shiftCalendarMonth('2025-01-31', 1), '2025-02-28');
    assert.equal(shiftCalendarMonth('2026-12-17', 1), '2027-01-17');
    assert.equal(shiftCalendarMonth('1900-01-01', -1), '1900-01-01');
    assert.equal(shiftCalendarMonth('2050-12-31', 1), '2050-12-31');
});
test('month grid is Monday first and every real day has an ISO date', () => {
    const cells = getMonthCells('2026-02-17');
    assert.deepEqual(cells.slice(0, 7), [null, null, null, null, null, null, '2026-02-01']);
    assert.equal(cells.filter(Boolean).length, 28);
    assert.equal(cells.at(-1), '2026-02-28');
});
test('date-only arithmetic crosses years without applying a local timezone', () => {
    assert.equal(moveDateByDays('2026-12-31', 1), '2027-01-01');
    assert.equal(moveDateByDays('2024-03-01', -1), '2024-02-29');
});
test('day events preserve three coincident events, display priority, and de-duplicate packages', () => {
    const events = [event('2026-02-17', 'ai_bashi', '00:00'), event('2026-02-17'), event('2026-02-17', 'nooruz')];
    const result = getDayEvents([response({ events }), response({ events })], '2026-02-17');
    assert.deepEqual(result.map(e => e.type), ['nooruz', 'new_moon', 'ai_bashi']);
});
test('Ramadan is included once on every day inside its inclusive date range', () => {
    const period = { type: 'ramadan', start_date: '2026-02-18', end_date: '2026-03-19', label_ky: 'Рамазан', label_ru: 'Месяц Рамадан', description_ky: '', description_ru: '' };
    const data = response({ periods: [period] });
    assert.equal(getDayEvents([data, data], '2026-02-18').length, 1);
    assert.equal(getDayEvents([data], '2026-03-19')[0].type, 'ramadan');
    assert.deepEqual(getDayEvents([data], '2026-03-20'), []);
});
test('January can resolve its lunar month from the preceding year package', () => {
    const previous = response({ year: 2025, lunar_months: [lunar('2025-12-20', '2026-01-18', 'АРСАР АЙ')] });
    assert.equal(getLunarMonthForDate([response(), previous], '2026-01-01')?.name, 'АРСАР АЙ');
    assert.equal(getLunarMonthForDate([response()], '2026-01-01'), null);
});
test('upcoming events cross years and include the start of a Ramadan period', () => {
    const next = response({ year: 2027, events: [event('2027-01-01', 'holiday', '00:00')] });
    assert.equal(getUpcomingEvent([response(), next], '2026-12-31')?.date, '2027-01-01');
    const data = response({ events: [event('2026-02-22')], periods: [{ type: 'ramadan', start_date: '2026-02-18', end_date: '2026-03-19', label_ky: '', label_ru: '', description_ky: '', description_ru: '' }] });
    assert.equal(getUpcomingEvent([data], '2026-02-17')?.type, 'ramadan');
});
test('only necessary adjacent packages are requested and supported bounds are respected', () => {
    const data = response({ events: [event('2026-02-22')], lunar_months: [lunar('2026-01-19', '2026-02-17'), lunar('2026-12-09', '2027-01-07')] });
    assert.deepEqual(getRequiredContext(data, '2026-01-01', true), [2025]);
    assert.deepEqual(getRequiredContext(data, '2026-02-17', true), []);
    assert.deepEqual(getRequiredContext(data, '2026-12-31', true), [2027]);
    assert.deepEqual(getRequiredContext(response({ year: 1900, lunar_months: [lunar('1900-01-19', '1900-12-31')] }), '1900-01-01', false), []);
    assert.deepEqual(getRequiredContext(response({ year: 2050 }), '2050-12-31', true), []);
});
test('visible lunar intervals request adjacent Gregorian event years even when the selected day is covered', () => {
    const data = response({ lunar_months: [lunar('2025-12-20', '2026-01-18'), lunar('2026-12-09', '2027-01-07')] });
    assert.deepEqual(getRequiredContext(data, '2026-01-01', false), [2025]);
    assert.deepEqual(getRequiredContext(data, '2026-12-20', false), [2027]);
});
