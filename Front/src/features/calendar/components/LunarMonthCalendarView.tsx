import React, { useEffect, useMemo, useRef, useState } from 'react';
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
    const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
    const monthSelectorRef = useRef<HTMLDivElement | null>(null);
    const selectedMonthOptionRef = useRef<HTMLButtonElement | null>(null);
    const selectedMonth = months[selectedIndex] ?? null;
    const monthsSignature = months.map((month) => `${month.name}:${getLunarMonthStartDate(month)}:${getLunarMonthEndDate(month)}`).join('|');

    useEffect(() => {
        setSelectedIndex(getDefaultIndex());
        setMonthDropdownOpen(false);
    }, [monthsSignature, initialMonthIndex]);

    useEffect(() => {
        if (!monthDropdownOpen) return;

        const selectedOption = selectedMonthOptionRef.current;
        window.requestAnimationFrame(() => {
            selectedOption?.scrollIntoView({ block: 'center' });
        });

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target;

            if (
                target instanceof Node &&
                monthSelectorRef.current &&
                !monthSelectorRef.current.contains(target)
            ) {
                setMonthDropdownOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMonthDropdownOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [monthDropdownOpen, selectedIndex]);

    const sections = useMemo(() => {
        if (!selectedMonth) {
            return [];
        }

        return buildLunarMonthSections(selectedMonth, language);
    }, [selectedMonth, language]);

    const setSelectedMonthIndex = (nextIndex: number) => {
        const safeIndex = Math.min(Math.max(nextIndex, 0), months.length - 1);
        const nextMonth = months[safeIndex];

        setSelectedIndex(safeIndex);
        setMonthDropdownOpen(false);
        if (nextMonth) {
            onMonthChange?.(nextMonth, safeIndex);
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

                <div className={styles.selectorLabel} ref={monthSelectorRef}>
                    <span>{language === 'ky' ? 'Айды тандоо' : 'Выбор месяца'}</span>
                    <div className={styles.monthControl}>
                        {selectedIndex > 0 && (
                            <button
                                type="button"
                                className={styles.monthStepButton}
                                onClick={() => setSelectedMonthIndex(selectedIndex - 1)}
                                aria-label={language === 'ky' ? 'Мурунку ай' : 'Предыдущий месяц'}
                            >
                                ‹
                            </button>
                        )}
                        <button
                            type="button"
                            className={styles.monthSelectButton}
                            onClick={() => setMonthDropdownOpen((current) => !current)}
                            aria-expanded={monthDropdownOpen}
                            aria-haspopup="listbox"
                        >
                            <span className={styles.monthSelectName}>{selectedMonth.name}</span>
                            <span className={styles.monthChevron} aria-hidden="true">▾</span>
                        </button>
                        {selectedIndex < months.length - 1 && (
                            <button
                                type="button"
                                className={styles.monthStepButton}
                                onClick={() => setSelectedMonthIndex(selectedIndex + 1)}
                                aria-label={language === 'ky' ? 'Кийинки ай' : 'Следующий месяц'}
                            >
                                ›
                            </button>
                        )}
                    </div>
                    {monthDropdownOpen && (
                        <div className={styles.monthDropdown} role="listbox">
                            {months.map((month, index) => {
                                const optionStartDate = getLunarMonthStartDate(month);
                                const optionEndDate = getLunarMonthEndDate(month);
                                const isSelected = index === selectedIndex;

                                return (
                                    <button
                                        key={`${month.name}-${optionStartDate}`}
                                        ref={isSelected ? selectedMonthOptionRef : undefined}
                                        type="button"
                                        className={`${styles.monthOption} ${isSelected ? styles.monthOptionActive : ''}`}
                                        onClick={() => setSelectedMonthIndex(index)}
                                        role="option"
                                        aria-selected={isSelected}
                                    >
                                        <span className={styles.monthOptionName}>{month.name}</span>
                                        <span className={styles.monthOptionDates}>
                                            {formatDisplayDate(optionStartDate)} - {formatDisplayDate(optionEndDate)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
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
