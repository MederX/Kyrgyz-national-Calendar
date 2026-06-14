import assert from 'node:assert/strict';
import test from 'node:test';

import { getLunarYearStructure } from './lunarYearStructure.js';

const NEW_MOONS_WITH_ARSAR = [
    '2025-12-22',
    '2026-01-20',
    '2026-02-18',
    '2026-03-19',
    '2026-04-17',
    '2026-05-16',
    '2026-06-14',
    '2026-07-13',
    '2026-08-11',
    '2026-09-09',
    '2026-10-08',
    '2026-11-06',
    '2026-12-05',
    '2027-01-03',
];

test('starts Birдин айы from the previous December new moon when it owns January', () => {
    const months = getLunarYearStructure(2026, NEW_MOONS_WITH_ARSAR);

    assert.equal(months[0].name, 'Бирдин айы');
    assert.equal(months[0].startDate, '2025-12-22');
    assert.equal(months[0].endDate, '2026-01-19');
    assert.equal(months[0].overlapDays, 19);
});

test('inserts one Арсар ай without advancing the next regular month name', () => {
    const months = getLunarYearStructure(2026, NEW_MOONS_WITH_ARSAR);

    assert.equal(months.length, 13);
    assert.equal(months[8].name, 'АРСАР АЙ');
    assert.equal(months[8].isArsar, true);
    assert.equal(months[8].arsarOf, 'Аяк оона');
    assert.equal(months[9].name, 'Тогуздун айы');
    assert.equal(months.at(-1).name, 'Үчтүн айы');
    assert.equal(months.at(-1).endDate, '2027-01-02');
});

test('starts Birдин айы from a January new moon when no late-December candidate fits', () => {
    const newMoons = [
        '2026-01-10',
        '2026-02-08',
        '2026-03-09',
        '2026-04-07',
        '2026-05-06',
        '2026-06-04',
        '2026-07-03',
        '2026-08-01',
        '2026-08-30',
        '2026-09-28',
        '2026-10-27',
        '2026-11-25',
        '2026-12-24',
        '2027-01-22',
    ];

    const months = getLunarYearStructure(2026, newMoons);

    assert.equal(months[0].name, 'Бирдин айы');
    assert.equal(months[0].startDate, '2026-01-10');
});
