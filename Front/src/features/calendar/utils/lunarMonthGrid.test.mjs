import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildLunarMonthSections,
    findLunarMonthIndexByDate,
    findLunarTransitionForNewMoon,
    formatDisplayDate,
    formatLunarDayLabel,
} from './lunarMonthGrid.js';

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

test('describes the lunar month transition for a new moon date', () => {
    const months = [
        { name: 'Теке', start_date: '2026-05-17', end_date: '2026-06-14' },
        {
            name: 'Баш оона',
            start_date: '2026-06-15',
            end_date: '2026-07-13',
            next_new_moon_datetime: '2026-07-14T05:43:00+06:00',
        },
    ];

    assert.deepEqual(findLunarTransitionForNewMoon(months, '2026-06-15'), {
        endingMonthName: 'Теке',
        endingMonthDisplayNameKy: 'Теке айы',
        startingMonthName: 'Баш оона',
        visibleUntilDate: '2026-07-14',
        visibleUntilDisplayDate: '14.07.2026',
    });
});

test('describes a new lunar year transition when Birdin is the first returned month', () => {
    const months = [
        {
            name: 'Бирдин айы',
            start_date: '2027-01-08',
            end_date: '2027-02-05',
            next_new_moon_datetime: '2027-02-06T09:57:00+06:00',
        },
    ];

    assert.deepEqual(findLunarTransitionForNewMoon(months, '2027-01-08'), {
        endingMonthName: 'Үчтүн айы',
        endingMonthDisplayNameKy: 'Үчтүн айы',
        startingMonthName: 'Бирдин айы',
        visibleUntilDate: '2027-02-06',
        visibleUntilDisplayDate: '06.02.2027',
    });
});

test('uses backend previous month context when first Birdin follows Arsar', () => {
    const months = [
        {
            name: 'Бирдин айы',
            previous_month_name: 'АРСАР АЙ',
            start_date: '2016-01-10',
            end_date: '2016-02-07',
            next_new_moon_datetime: '2016-02-08T20:38:00+06:00',
        },
    ];

    assert.deepEqual(findLunarTransitionForNewMoon(months, '2016-01-10'), {
        endingMonthName: 'АРСАР АЙ',
        endingMonthDisplayNameKy: 'АРСАР АЙ',
        startingMonthName: 'Бирдин айы',
        visibleUntilDate: '2016-02-08',
        visibleUntilDisplayDate: '08.02.2016',
    });
});

test('describes a next lunar year transition immediately after the last returned month', () => {
    const months = [
        {
            name: 'Үчтүн айы',
            start_date: '2031-11-15',
            end_date: '2031-12-13',
            next_new_moon_datetime: '2031-12-14T21:07:00+06:00',
        },
    ];

    assert.deepEqual(findLunarTransitionForNewMoon(months, '2031-12-14'), {
        endingMonthName: 'Үчтүн айы',
        endingMonthDisplayNameKy: 'Үчтүн айы',
        startingMonthName: 'Бирдин айы',
        visibleUntilDate: null,
        visibleUntilDisplayDate: null,
    });
});

test('describes the transition into Arsar month without special-casing the label', () => {
    const months = [
        { name: 'Тогуздун айы', start_date: '2026-08-12', end_date: '2026-09-10' },
        {
            name: 'АРСАР АЙ',
            start_date: '2026-09-11',
            end_date: '2026-10-09',
            next_new_moon_datetime: '2026-10-10T06:50:00+06:00',
        },
    ];

    assert.deepEqual(findLunarTransitionForNewMoon(months, '2026-09-11'), {
        endingMonthName: 'Тогуздун айы',
        endingMonthDisplayNameKy: 'Тогуздун айы',
        startingMonthName: 'АРСАР АЙ',
        visibleUntilDate: '2026-10-10',
        visibleUntilDisplayDate: '10.10.2026',
    });
});

test('adds айы to short Kyrgyz month names only when they end a transition', () => {
    const months = [
        { name: 'Чын куран', start_date: '2026-02-17', end_date: '2026-03-18' },
        {
            name: 'Бугу',
            start_date: '2026-03-19',
            end_date: '2026-04-16',
            next_new_moon_datetime: '2026-04-17T05:52:00+06:00',
        },
    ];

    assert.equal(
        findLunarTransitionForNewMoon(months, '2026-03-19').endingMonthDisplayNameKy,
        'Чын куран айы',
    );
});
