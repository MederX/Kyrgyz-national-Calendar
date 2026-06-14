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
