import React, { useMemo, useState } from 'react';
import type { Language } from '../types/calendar.types';
import styles from './YearControl.module.css';

interface Props {
    value: number;
    onChange: (year: number) => void;
    language: Language;
    getAnimalLabel: (year: number) => string;
}

const START_YEAR = 1900;
const END_YEAR = 2050;

export const YearControl: React.FC<Props> = ({
    value,
    onChange,
    language,
    getAnimalLabel,
}) => {
    const [open, setOpen] = useState(false);
    const years = useMemo(
        () => Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i),
        []
    );

    const setYear = (year: number) => {
        onChange(Math.min(END_YEAR, Math.max(START_YEAR, year)));
        setOpen(false);
    };

    return (
        <div className={styles.wrapper}>
            <button
                className={styles.stepButton}
                onClick={() => setYear(value - 1)}
                aria-label={language === 'ky' ? 'Мурунку жыл' : 'Предыдущий год'}
            >
                ‹
            </button>
            <button
                className={styles.yearButton}
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
                aria-haspopup="listbox"
            >
                <span>{value}</span>
                <span className={styles.chevron}>▾</span>
            </button>
            <button
                className={styles.stepButton}
                onClick={() => setYear(value + 1)}
                aria-label={language === 'ky' ? 'Кийинки жыл' : 'Следующий год'}
            >
                ›
            </button>
            {open && (
                <div className={styles.dropdown} role="listbox">
                    {years.map((year) => (
                        <button
                            key={year}
                            className={`${styles.option} ${year === value ? styles.optionActive : ''}`}
                            onClick={() => setYear(year)}
                            role="option"
                            aria-selected={year === value}
                        >
                            <span>{year}</span>
                            <span>{getAnimalLabel(year)}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
