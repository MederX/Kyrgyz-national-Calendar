const DAY_MS = 24 * 60 * 60 * 1000;

export const DAY_HEADERS = {
    ky: ['Дүй', 'Шей', 'Шар', 'Бей', 'Жум', 'Ише', 'Жек'],
    ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
};

const GREGORIAN_MONTHS = {
    ky: [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
    ],
    ru: [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
    ],
};

const KYRGYZ_MONTH_NAMES_REQUIRING_AYY_SUFFIX = new Set([
    'Жалган куран',
    'Чын куран',
    'Бугу',
    'Кулжа',
    'Теке',
    'Баш оона',
    'Аяк оона',
]);

const KYRGYZ_LUNAR_MONTH_SEQUENCE = [
    'Бирдин айы',
    'Жалган куран',
    'Чын куран',
    'Бугу',
    'Кулжа',
    'Теке',
    'Баш оона',
    'Аяк оона',
    'Тогуздун айы',
    'Жетинин айы',
    'Бештин айы',
    'Үчтүн айы',
];

export function parseIsoDate(value) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

export function toIsoDate(date) {
    return date.toISOString().slice(0, 10);
}

export function formatDisplayDate(isoDate) {
    const [year, month, day] = isoDate.split('-');
    return `${day}-${month}-${year}`;
}

function formatDisplayDateWithDots(isoDate) {
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
}

function addDays(date, days) {
    return new Date(date.getTime() + days * DAY_MS);
}

function compareDates(left, right) {
    return left.getTime() - right.getTime();
}

export function daysBetween(start, end) {
    return Math.floor((end.getTime() - start.getTime()) / DAY_MS);
}

function startOfUtcMonth(year, monthIndex) {
    return new Date(Date.UTC(year, monthIndex, 1));
}

function endOfUtcMonth(year, monthIndex) {
    return addDays(startOfUtcMonth(year, monthIndex + 1), -1);
}

function getMondayFirstOffset(date) {
    return (date.getUTCDay() + 6) % 7;
}

export function getTodayIsoDate() {
    const now = new Date();
    return toIsoDate(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

export function getLunarMonthStartDate(month) {
    return month.start_date ?? month.startDate;
}

export function getLunarMonthEndDate(month) {
    return month.end_date ?? month.endDate;
}

export function isLunarMonthArsar(month) {
    return Boolean(month.is_arsar ?? month.isArsar);
}

export function formatKyrgyzEndingLunarMonthName(monthName) {
    return KYRGYZ_MONTH_NAMES_REQUIRING_AYY_SUFFIX.has(monthName)
        ? `${monthName} айы`
        : monthName;
}

function getPreviousRegularLunarMonthName(monthName) {
    const monthIndex = KYRGYZ_LUNAR_MONTH_SEQUENCE.indexOf(monthName);
    if (monthIndex === -1) {
        return null;
    }

    return KYRGYZ_LUNAR_MONTH_SEQUENCE[
        (monthIndex + KYRGYZ_LUNAR_MONTH_SEQUENCE.length - 1) % KYRGYZ_LUNAR_MONTH_SEQUENCE.length
    ];
}

function getNextRegularLunarMonthName(monthName) {
    const monthIndex = KYRGYZ_LUNAR_MONTH_SEQUENCE.indexOf(monthName);
    if (monthIndex === -1) {
        return null;
    }

    return KYRGYZ_LUNAR_MONTH_SEQUENCE[(monthIndex + 1) % KYRGYZ_LUNAR_MONTH_SEQUENCE.length];
}

export function getLunarMonthDays(month) {
    const start = parseIsoDate(getLunarMonthStartDate(month));
    const end = parseIsoDate(getLunarMonthEndDate(month));
    return month.days ?? daysBetween(start, end) + 1;
}

export function formatLunarDayLabel(lunarDay, language = 'ky') {
    return language === 'ky'
        ? `${lunarDay}-күн`
        : `${lunarDay}-ЛД`;
}

export function findLunarMonthIndexByDate(months, isoDate = getTodayIsoDate()) {
    return months.findIndex((month) => (
        getLunarMonthStartDate(month) <= isoDate &&
        getLunarMonthEndDate(month) >= isoDate
    ));
}

export function findLunarTransitionForNewMoon(months, isoDate) {
    const startingMonthIndex = months.findIndex((month) => getLunarMonthStartDate(month) === isoDate);

    if (startingMonthIndex === 0) {
        const startingMonth = months[startingMonthIndex];
        const endingMonthName = startingMonth.previous_month_name
            ?? getPreviousRegularLunarMonthName(startingMonth.name);

        if (!endingMonthName) {
            return null;
        }

        const visibleUntilDate = startingMonth.next_new_moon_datetime
            ? startingMonth.next_new_moon_datetime.slice(0, 10)
            : toIsoDate(addDays(parseIsoDate(getLunarMonthEndDate(startingMonth)), 1));

        return {
            endingMonthName,
            endingMonthDisplayNameKy: formatKyrgyzEndingLunarMonthName(endingMonthName),
            startingMonthName: startingMonth.name,
            visibleUntilDate,
            visibleUntilDisplayDate: formatDisplayDateWithDots(visibleUntilDate),
        };
    }

    if (startingMonthIndex < 0) {
        const endingMonth = months.at(-1);

        if (!endingMonth) {
            return null;
        }

        const nextNewMoonDate = endingMonth.next_new_moon_datetime
            ? endingMonth.next_new_moon_datetime.slice(0, 10)
            : toIsoDate(addDays(parseIsoDate(getLunarMonthEndDate(endingMonth)), 1));

        if (nextNewMoonDate !== isoDate) {
            return null;
        }

        const startingMonthName = getNextRegularLunarMonthName(endingMonth.name);

        if (!startingMonthName) {
            return null;
        }

        return {
            endingMonthName: endingMonth.name,
            endingMonthDisplayNameKy: formatKyrgyzEndingLunarMonthName(endingMonth.name),
            startingMonthName,
            visibleUntilDate: null,
            visibleUntilDisplayDate: null,
        };
    }

    const endingMonth = months[startingMonthIndex - 1];
    const startingMonth = months[startingMonthIndex];
    const visibleUntilDate = startingMonth.next_new_moon_datetime
        ? startingMonth.next_new_moon_datetime.slice(0, 10)
        : toIsoDate(addDays(parseIsoDate(getLunarMonthEndDate(startingMonth)), 1));

    return {
        endingMonthName: endingMonth.name,
        endingMonthDisplayNameKy: formatKyrgyzEndingLunarMonthName(endingMonth.name),
        startingMonthName: startingMonth.name,
        visibleUntilDate,
        visibleUntilDisplayDate: formatDisplayDateWithDots(visibleUntilDate),
    };
}

export function buildLunarMonthSections(month, language = 'ky', todayIso = getTodayIsoDate()) {
    const startDate = parseIsoDate(getLunarMonthStartDate(month));
    const endDate = parseIsoDate(getLunarMonthEndDate(month));
    const monthNames = GREGORIAN_MONTHS[language] ?? GREGORIAN_MONTHS.ky;
    const sections = [];

    let cursor = startOfUtcMonth(startDate.getUTCFullYear(), startDate.getUTCMonth());
    const lastMonth = startOfUtcMonth(endDate.getUTCFullYear(), endDate.getUTCMonth());

    while (compareDates(cursor, lastMonth) <= 0) {
        const year = cursor.getUTCFullYear();
        const monthIndex = cursor.getUTCMonth();
        const monthStart = startOfUtcMonth(year, monthIndex);
        const monthEnd = endOfUtcMonth(year, monthIndex);
        const firstDayOffset = getMondayFirstOffset(monthStart);
        const daysInMonth = monthEnd.getUTCDate();
        const cells = [];

        for (let index = 0; index < firstDayOffset; index += 1) {
            cells.push({
                key: `empty-start-${year}-${monthIndex}-${index}`,
                isoDate: null,
                gregorianDay: null,
                lunarDay: null,
                isInLunarMonth: false,
                isToday: false,
            });
        }

        for (let day = 1; day <= daysInMonth; day += 1) {
            const date = new Date(Date.UTC(year, monthIndex, day));
            const isoDate = toIsoDate(date);
            const isInLunarMonth =
                compareDates(date, startDate) >= 0 &&
                compareDates(date, endDate) <= 0;

            cells.push({
                key: isoDate,
                isoDate,
                gregorianDay: day,
                lunarDay: isInLunarMonth ? daysBetween(startDate, date) + 1 : null,
                isInLunarMonth,
                isToday: isoDate === todayIso,
            });
        }

        sections.push({
            key: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
            title: `${monthNames[monthIndex]} ${year}`,
            cells,
        });

        cursor = startOfUtcMonth(year, monthIndex + 1);
    }

    return sections;
}
