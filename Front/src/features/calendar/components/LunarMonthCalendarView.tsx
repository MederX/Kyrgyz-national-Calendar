import React, { useEffect, useMemo, useState } from 'react';
import type { Language, LunarMonth } from '../types/calendar.types';
import {
    buildLunarMonthSections,
    DAY_HEADERS,
    findLunarMonthIndexByDate,
    formatDisplayDate,
    formatLunarDayLabel,
    getLunarMonthDays,
    getLunarMonthEndDate,
    getLunarMonthStartDate,
    isLunarMonthArsar,
} from '../utils/lunarMonthGrid';
import styles from './LunarMonthCalendarView.module.css';

interface Props {
    months: LunarMonth[];
    language: Language;
    initialMonthIndex?: number;
    onMonthChange?: (month: LunarMonth, index: number) => void;
}

export const LunarMonthCalendarView: React.FC<Props> = ({
    months,
    language,
    initialMonthIndex = 0,
    onMonthChange,
}) => {
    const getDefaultIndex = () => {
        const currentLunarMonthIndex = findLunarMonthIndexByDate(months);
        if (currentLunarMonthIndex >= 0) {
            return currentLunarMonthIndex;
        }

        return Math.min(Math.max(initialMonthIndex, 0), Math.max(months.length - 1, 0));
    };

    const safeInitialIndex = getDefaultIndex();
    const [selectedIndex, setSelectedIndex] = useState(safeInitialIndex);
    const selectedMonth = months[selectedIndex] ?? null;
    const monthsSignature = months.map((month) => `${month.name}:${getLunarMonthStartDate(month)}:${getLunarMonthEndDate(month)}`).join('|');

    useEffect(() => {
        setSelectedIndex(getDefaultIndex());
    }, [monthsSignature, initialMonthIndex]);

    const sections = useMemo(() => {
        if (!selectedMonth) {
            return [];
        }

        return buildLunarMonthSections(selectedMonth, language);
    }, [selectedMonth, language]);

    const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const nextIndex = Number(event.target.value);
        const nextMonth = months[nextIndex];

        setSelectedIndex(nextIndex);
        if (nextMonth) {
            onMonthChange?.(nextMonth, nextIndex);
        }
    };

    if (!selectedMonth) {
        return null;
    }

    const dayHeaders = DAY_HEADERS[language];
    const totalDays = getLunarMonthDays(selectedMonth);
    const startDate = getLunarMonthStartDate(selectedMonth);
    const endDate = getLunarMonthEndDate(selectedMonth);
    const isArsar = isLunarMonthArsar(selectedMonth);

    return (
        <section className={`${styles.wrapper} ${isArsar ? styles.arsar : ''}`}>
            <div className={styles.header}>
                <div className={styles.titleBlock}>
                    <span className={styles.eyebrow}>
                        {language === 'ky' ? 'Тандалган ай' : 'Выбранный месяц'}
                    </span>
                    <h2 className={styles.title}>{selectedMonth.name}</h2>
                    <p className={styles.period}>
                        {formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}
                        <span className={styles.daysCount}>
                            {language === 'ky' ? `${totalDays} күн` : `${totalDays} дней`}
                        </span>
                    </p>
                </div>

                <label className={styles.selectorLabel}>
                    <span>{language === 'ky' ? 'Айды тандоо' : 'Выбор месяца'}</span>
                    <select
                        className={styles.monthSelect}
                        value={selectedIndex}
                        onChange={handleMonthChange}
                    >
                        {months.map((month, index) => (
                            <option key={`${month.name}-${getLunarMonthStartDate(month)}`} value={index}>
                                {month.name}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {isArsar && (
                <div className={styles.arsarNotice}>
                    <strong>{language === 'ky' ? 'Арсар ай' : 'Арсар ай'}</strong>
                    <span>
                        {language === 'ky'
                            ? 'мезгил менен ай аталыштарын кайра теңдөө үчүн колдонулган кошумча ай'
                            : 'високосный буферный месяц: выравнивает лунный цикл с сезонными названиями'}
                    </span>
                </div>
            )}

            <div className={styles.sectionsGrid}>
                {sections.map((section) => (
                    <div key={section.key} className={styles.monthPanel}>
                        <div className={styles.gregorianTitle}>{section.title}</div>
                        <div className={styles.grid}>
                            {dayHeaders.map((header) => (
                                <div key={header} className={styles.dayHeader}>
                                    {header}
                                </div>
                            ))}

                            {section.cells.map((cell) => (
                                <div
                                    key={cell.key}
                                    className={`${styles.dayCell} ${cell.isInLunarMonth ? styles.inRange : styles.outOfRange} ${cell.isToday ? styles.today : ''}`}
                                    aria-label={
                                        cell.isoDate && cell.lunarDay
                                            ? `${cell.isoDate}, ${language === 'ky' ? `${cell.lunarDay}-ай күнү` : `${cell.lunarDay}-й лунный день`}`
                                            : undefined
                                    }
                                >
                                    {cell.gregorianDay !== null && (
                                        <>
                                            <span className={styles.gregorianDay}>
                                                {cell.gregorianDay}
                                            </span>
                                            {cell.lunarDay !== null && (
                                                <span className={styles.lunarDay}>
                                                    {formatLunarDayLabel(cell.lunarDay, language)}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
