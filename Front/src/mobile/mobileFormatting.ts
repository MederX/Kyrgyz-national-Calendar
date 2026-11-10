import type { Language } from '../features/calendar/types/calendar.types';
import { formatKyFullDate, MONTH_NAMES_RU_GENITIVE } from '../features/calendar/utils/calendarCopy.ts';

const weekdays = {
    ky: ['Жекшемби', 'Дүйшөмбү', 'Шейшемби', 'Шаршемби', 'Бейшемби', 'Жума', 'Ишемби'],
    ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
};

export function formatGmtOffset(timeZone: string, date: Date): string {
    const offset = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
        .formatToParts(date).find(part => part.type === 'timeZoneName')!.value;
    return offset.replace(/^GMT[+-]0(?::00)?$/, 'GMT');
}

export function getWeekdayName(isoDate: string, language: Language): string {
    return weekdays[language][new Date(`${isoDate}T00:00:00Z`).getUTCDay()];
}

export function formatMobileDate(isoDate: string, language: Language): string {
    const date = new Date(`${isoDate}T00:00:00Z`);
    const label = language === 'ky' ? formatKyFullDate(date) : `${date.getUTCDate()} ${MONTH_NAMES_RU_GENITIVE[date.getUTCMonth()]}`;
    return `${label} ${date.getUTCFullYear()}`;
}
