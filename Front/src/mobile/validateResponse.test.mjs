import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCalendarResponse } from './validateResponse.ts';

const event = { date: '2026-02-17', time: '18:01', type: 'new_moon', label_ky: 'Ай жаңырган күн', label_ru: 'Новолуние', description_ky: '', description_ru: '' };
const valid = { year: 2026, month: null, events: [event], periods: [], lunar_months: [{ name: 'Жалган куран', start_date: '2026-02-17', end_date: '2026-03-18', days: 30 }] };
test('valid API data is retained rather than rewritten', () => {
    assert.equal(validateCalendarResponse(valid, 2026), valid);
});
test('malformed nested event data fails before models or rendering consume it', () => {
    for (const broken of [null, {}, { ...event, date: '2026-02-31' }, { ...event, type: 'unknown' }]) {
        assert.throws(() => validateCalendarResponse({ ...valid, events: [broken] }, 2026), /Invalid calendar API response/);
    }
});
test('invalid periods and impossible lunar intervals are rejected as request errors', () => {
    for (const broken of [null, { start_date: '2026-02-18', end_date: '2026-03-19', type: 'ramadan' }]) {
        assert.throws(() => validateCalendarResponse({ ...valid, periods: [broken] }, 2026));
    }
    assert.throws(() => validateCalendarResponse({ ...valid, lunar_months: [null] }, 2026));
    assert.throws(() => validateCalendarResponse({ ...valid, lunar_months: [{ ...valid.lunar_months[0], days: 999 }] }, 2026));
    assert.throws(() => validateCalendarResponse({ ...valid, year: 2025 }, 2026));
});
