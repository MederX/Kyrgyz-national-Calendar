const DAY_MS = 24 * 60 * 60 * 1000;
const ARSAR_MIN_OVERLAP_DAYS = 10;

export const KYRGYZ_LUNAR_MONTHS = [
    { name: 'Бирдин айы', seasonMonth: 1 },
    { name: 'Жалган куран', seasonMonth: 2 },
    { name: 'Чын куран', seasonMonth: 3 },
    { name: 'Бугу', seasonMonth: 4 },
    { name: 'Кулжа', seasonMonth: 5 },
    { name: 'Теке', seasonMonth: 6 },
    { name: 'Баш оона', seasonMonth: 7 },
    { name: 'Аяк оона', seasonMonth: 8 },
    { name: 'Тогуздун айы', seasonMonth: 9 },
    { name: 'Жетинин айы', seasonMonth: 10 },
    { name: 'Бештин айы', seasonMonth: 11 },
    { name: 'Үчтүн айы', seasonMonth: 12 },
];

function assertYear(targetYear) {
    if (!Number.isInteger(targetYear) || targetYear < 1900 || targetYear > 2050) {
        throw new RangeError('targetYear must be an integer from 1900 to 2050');
    }
}

function parseIsoDate(value) {
    if (value instanceof Date) {
        return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
    }

    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new TypeError('New moon dates must use YYYY-MM-DD format');
    }

    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

function toIsoDate(date) {
    return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
    return new Date(date.getTime() + days * DAY_MS);
}

function compareDates(left, right) {
    return left.getTime() - right.getTime();
}

function daysInclusive(start, end) {
    return Math.floor((end.getTime() - start.getTime()) / DAY_MS) + 1;
}

function overlapDays(startA, endA, startB, endB) {
    const start = compareDates(startA, startB) > 0 ? startA : startB;
    const end = compareDates(endA, endB) < 0 ? endA : endB;

    if (compareDates(start, end) > 0) {
        return 0;
    }

    return daysInclusive(start, end);
}

function gregorianMonthRange(year, monthNumber) {
    const start = new Date(Date.UTC(year, monthNumber - 1, 1));
    const end = addDays(new Date(Date.UTC(year, monthNumber, 1)), -1);
    return { start, end };
}

function normalizeNewMoonDates(newMoonDates) {
    if (!Array.isArray(newMoonDates) || newMoonDates.length < 13) {
        throw new Error('getLunarYearStructure requires at least 13 local new moon dates');
    }

    const unique = new Map();
    for (const value of newMoonDates) {
        const date = parseIsoDate(value);
        unique.set(toIsoDate(date), date);
    }

    return [...unique.values()].sort(compareDates);
}

function findPreviousRegularMonth(months) {
    for (let index = months.length - 1; index >= 0; index -= 1) {
        if (!months[index].isArsar) {
            return months[index];
        }
    }

    return null;
}

function findBirdinStartIndex(targetYear, newMoons) {
    const windowStart = new Date(Date.UTC(targetYear - 1, 11, 20));
    const windowEnd = new Date(Date.UTC(targetYear, 0, 31));
    const january = gregorianMonthRange(targetYear, 1);

    const candidates = [];

    for (let index = 0; index < newMoons.length - 1; index += 1) {
        const start = newMoons[index];
        if (compareDates(start, windowStart) < 0 || compareDates(start, windowEnd) > 0) {
            continue;
        }

        const end = addDays(newMoons[index + 1], -1);
        candidates.push({
            index,
            overlap: overlapDays(start, end, january.start, january.end),
        });
    }

    if (candidates.length === 0) {
        throw new Error(`No Бирдин айы new moon candidate found for ${targetYear}`);
    }

    const aligned = candidates
        .filter((candidate) => candidate.overlap >= ARSAR_MIN_OVERLAP_DAYS)
        .sort((left, right) => right.overlap - left.overlap);

    return (aligned[0] ?? candidates[0]).index;
}

/**
 * Builds the traditional Kyrgyz lunar-year month chain for a selected year.
 *
 * `newMoonDates` must be local astronomical new-moon dates for the user's
 * timezone, including late December of the previous year and January of the
 * following year. Date strings must be in `YYYY-MM-DD` format.
 */
export function getLunarYearStructure(targetYear, newMoonDates = globalThis.KYRGYZ_NEW_MOON_DATES) {
    assertYear(targetYear);

    const newMoons = normalizeNewMoonDates(newMoonDates);
    let newMoonIndex = findBirdinStartIndex(targetYear, newMoons);
    let monthNameIndex = 0;
    let hasArsar = false;
    const months = [];

    while (monthNameIndex < KYRGYZ_LUNAR_MONTHS.length) {
        const start = newMoons[newMoonIndex];
        const nextStart = newMoons[newMoonIndex + 1];

        if (!start || !nextStart) {
            throw new Error(`Not enough new moon dates to finish lunar year ${targetYear}`);
        }

        const end = addDays(nextStart, -1);
        const month = KYRGYZ_LUNAR_MONTHS[monthNameIndex];
        const season = gregorianMonthRange(targetYear, month.seasonMonth);
        const seasonOverlapDays = overlapDays(start, end, season.start, season.end);
        const previousRegularMonth = findPreviousRegularMonth(months);
        const shouldInsertArsar =
            !hasArsar &&
            monthNameIndex > 0 &&
            seasonOverlapDays < ARSAR_MIN_OVERLAP_DAYS;

        if (shouldInsertArsar) {
            const arsarOf = previousRegularMonth?.baseName ?? KYRGYZ_LUNAR_MONTHS[monthNameIndex - 1].name;

            months.push({
                name: 'АРСАР АЙ',
                baseName: null,
                startDate: toIsoDate(start),
                endDate: toIsoDate(end),
                nextNewMoonDate: toIsoDate(nextStart),
                days: daysInclusive(start, end),
                isArsar: true,
                arsarOf,
                seasonMonth: null,
                overlapDays: seasonOverlapDays,
            });

            hasArsar = true;
            newMoonIndex += 1;
            continue;
        }

        months.push({
            name: month.name,
            baseName: month.name,
            startDate: toIsoDate(start),
            endDate: toIsoDate(end),
            nextNewMoonDate: toIsoDate(nextStart),
            days: daysInclusive(start, end),
            isArsar: false,
            arsarOf: null,
            seasonMonth: month.seasonMonth,
            overlapDays: seasonOverlapDays,
        });

        monthNameIndex += 1;
        newMoonIndex += 1;
    }

    return months;
}
