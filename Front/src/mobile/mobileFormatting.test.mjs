import test from 'node:test';
import assert from 'node:assert/strict';
import { getWeekdayName, formatMobileDate, formatGmtOffset } from './mobileFormatting.ts';

test('location GMT labels support whole-hour, fractional and zero offsets', () => {
    const date = new Date('2026-02-17T12:00:00Z');
    assert.equal(formatGmtOffset('Asia/Bishkek', date), 'GMT+6');
    assert.equal(formatGmtOffset('Asia/Kolkata', date), 'GMT+5:30');
    assert.equal(formatGmtOffset('Asia/Kathmandu', date), 'GMT+5:45');
    assert.equal(formatGmtOffset('UTC', date), 'GMT');
});

test('location GMT labels follow daylight saving in the selected city', () => {
    assert.equal(formatGmtOffset('America/New_York', new Date('2026-02-17T12:00:00Z')), 'GMT-5');
    assert.equal(formatGmtOffset('America/New_York', new Date('2026-07-17T12:00:00Z')), 'GMT-4');
});

test('Kyrgyz weekdays never depend on browser support for the ky locale', () => {
    for (const [date, expected] of [['2026-02-16', 'Дүйшөмбү'], ['2026-02-17', 'Шейшемби'], ['2026-02-18', 'Шаршемби'], ['2026-02-19', 'Бейшемби'], ['2026-02-20', 'Жума'], ['2026-02-21', 'Ишемби'], ['2026-02-22', 'Жекшемби']]) assert.equal(getWeekdayName(date, 'ky'), expected);
    assert.equal(getWeekdayName('2026-02-17', 'ru'), 'Вторник');
});
test('accessible date labels reuse website month wording in both languages', () => {
    assert.equal(formatMobileDate('2026-02-17', 'ky'), 'Жалган куран айынын он жетиси 2026');
    assert.equal(formatMobileDate('2026-02-17', 'ru'), '17 февраля 2026');
});
