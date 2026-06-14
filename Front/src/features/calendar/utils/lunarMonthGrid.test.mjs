import assert from 'node:assert/strict';
import test from 'node:test';

import { buildLunarMonthSections, findLunarMonthIndexByDate, formatDisplayDate, formatLunarDayLabel } from './lunarMonthGrid.js';

test('builds dynamic Gregorian sections from backend lunar month JSON', () => {
    const month = {
        name: 'Бирдин айы',
        start_date: '2025-12-20',
        end_date: '2026-01-18',
        days: 30,
        is_arsar: false,
    };

    const sections = buildLunarMonthSections(month, 'ru', '2026-06-14');
    const inRangeCells = sections.flatMap((section) => section.cells).filter((cell) => cell.isInLunarMonth);

    assert.equal(sections.length, 2);
    assert.equal(sections[0].key, '2025-12');
    assert.equal(sections[1].key, '2026-01');
    assert.equal(inRangeCells.length, 30);
    assert.equal(inRangeCells[0].isoDate, '2025-12-20');
    assert.equal(inRangeCells[0].lunarDay, 1);
    assert.equal(inRangeCells.at(-1).isoDate, '2026-01-18');
    assert.equal(inRangeCells.at(-1).lunarDay, 30);
});

test('keeps Arsar month labels fully data-driven', () => {
    const month = {
        name: 'АРСАР АЙ',
        start_date: '2026-09-11',
        end_date: '2026-10-09',
        days: 29,
        is_arsar: true,
    };

    const sections = buildLunarMonthSections(month, 'ky', '2026-06-14');
    const inRangeCells = sections.flatMap((section) => section.cells).filter((cell) => cell.isInLunarMonth);

    assert.equal(sections.length, 2);
    assert.equal(inRangeCells.length, 29);
    assert.equal(inRangeCells[0].lunarDay, 1);
    assert.equal(inRangeCells.at(-1).lunarDay, 29);
});

test('formats visible lunar day labels clearly', () => {
    assert.equal(formatLunarDayLabel(1, 'ky'), '1-күн');
    assert.equal(formatLunarDayLabel(10, 'ru'), '10-ЛД');
});

test('formats backend ISO dates for visible period labels', () => {
    assert.equal(formatDisplayDate('2026-05-17'), '17-05-2026');
});

test('finds the lunar month containing the supplied date', () => {
    const months = [
        { name: 'Теке', start_date: '2026-05-17', end_date: '2026-06-14' },
        { name: 'Баш оона', start_date: '2026-06-15', end_date: '2026-07-13' },
    ];

    assert.equal(findLunarMonthIndexByDate(months, '2026-06-14'), 0);
    assert.equal(findLunarMonthIndexByDate(months, '2026-06-15'), 1);
    assert.equal(findLunarMonthIndexByDate(months, '2026-08-01'), -1);
});
