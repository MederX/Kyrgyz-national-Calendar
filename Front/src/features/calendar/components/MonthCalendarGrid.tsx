import React, { useMemo } from 'react';
import {
    startOfMonth,
    endOfMonth,
    getDay,
    getDate,
    isToday as isTodayFn,
    format,
} from 'date-fns';
import type { CalendarEvent, CalendarPeriod } from '../types/calendar.types';
import { DayCell } from './DayCell';
import styles from './MonthCalendarGrid.module.css';

import { Language } from '../types/calendar.types';

interface Props {
    events: CalendarEvent[];
    periods: CalendarPeriod[];
    selectedMonth: Date;
    language: Language;
    onDayClick: (day: number) => void;
}

const DAY_HEADERS_KY = ['Дүй', 'Шей', 'Шар', 'Бей', 'Жум', 'Ише', 'Жек'];
const DAY_HEADERS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const MonthCalendarGrid: React.FC<Props> = ({
    events,
    periods,
    selectedMonth,
    language,
    onDayClick,
}) => {
    const { cells, eventsByDay, ramadanDays } = useMemo(() => {
        const first = startOfMonth(selectedMonth);
        const last = endOfMonth(selectedMonth);
        const totalDays = getDate(last);

        // Monday = 0, Sunday = 6
        const firstDayOffset = (getDay(first) + 6) % 7;

        // Build empty + day cells
        const cells: (number | null)[] = [];
        for (let i = 0; i < firstDayOffset; i++) cells.push(null);
        for (let d = 1; d <= totalDays; d++) cells.push(d);

        // Filter out events that do not belong to this month
        const monthNumStr = String(selectedMonth.getMonth() + 1).padStart(2, '0');
        const monthYearStr = String(selectedMonth.getFullYear());
        const thisMonthEvents = events.filter((e) => {
            const [y, m] = e.date.split('-');
            return y === monthYearStr && m === monthNumStr;
        });

        // Group events by day number
        const eventsByDay: Record<number, CalendarEvent[]> = {};
        for (const ev of thisMonthEvents) {
            const day = parseInt(ev.date.split('-')[2], 10);
            if (!eventsByDay[day]) eventsByDay[day] = [];
            eventsByDay[day].push(ev);
        }

        const monthYearDashStr = format(selectedMonth, 'yyyy-MM');
        const ramadanDays: Record<number, boolean> = {};
        const monthStartStr = format(first, 'yyyy-MM-dd');
        const monthEndStr = format(last, 'yyyy-MM-dd');

        for (const period of periods) {
            if (period.type !== 'ramadan') continue;
            if (period.end_date < monthStartStr || period.start_date > monthEndStr) continue;

            const startDay = period.start_date.slice(0, 7) === monthYearDashStr
                ? parseInt(period.start_date.slice(8, 10), 10)
                : 1;
            const endDay = period.end_date.slice(0, 7) === monthYearDashStr
                ? parseInt(period.end_date.slice(8, 10), 10)
                : totalDays;

            for (let day = startDay; day <= endDay; day++) {
                ramadanDays[day] = true;
            }
        }

        return { cells, eventsByDay, ramadanDays };
    }, [selectedMonth, events, periods]);

    const monthIndex = selectedMonth.getMonth();
    const dayHeaders = language === 'ky' ? DAY_HEADERS_KY : DAY_HEADERS_RU;

    return (
        <div className={styles.wrapper}>
            <div className={styles.grid}>
                {dayHeaders.map((h) => (
                    <div key={h} className={styles.header}>
                        {h}
                    </div>
                ))}
                {cells.map((day, i) => {
                    const weekDayIndex = i % 7;
                    const dateObj =
                        day !== null
                            ? new Date(
                                selectedMonth.getFullYear(),
                                monthIndex,
                                day
                            )
                            : null;
                    const today = dateObj ? isTodayFn(dateObj) : false;
                    const isInRamadan = day !== null && Boolean(ramadanDays[day]);
                    const previousDay = i > 0 ? cells[i - 1] : null;
                    const nextDay = i < cells.length - 1 ? cells[i + 1] : null;
                    const ramadanContinuesLeft =
                        isInRamadan &&
                        weekDayIndex !== 0 &&
                        previousDay !== null &&
                        Boolean(ramadanDays[previousDay]);
                    const ramadanContinuesRight =
                        isInRamadan &&
                        weekDayIndex !== 6 &&
                        nextDay !== null &&
                        Boolean(ramadanDays[nextDay]);

                    return (
                        <DayCell
                            key={i}
                            day={day}
                            events={day !== null ? eventsByDay[day] || [] : []}
                            isToday={today}
                            isInRamadan={isInRamadan}
                            ramadanContinuesLeft={ramadanContinuesLeft}
                            ramadanContinuesRight={ramadanContinuesRight}
                            onClick={() => day !== null && onDayClick(day)}
                        />
                    );
                })}
            </div>
        </div>
    );
};
