import React, { useEffect, useMemo, useRef, useState } from 'react';
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
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const selectedOptionRef = useRef<HTMLButtonElement | null>(null);
    const years = useMemo(
        () => Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i),
        []
    );

    useEffect(() => {
        if (!open) return;

        const selectedOption = selectedOptionRef.current;
        window.requestAnimationFrame(() => {
            selectedOption?.scrollIntoView({ block: 'center' });
        });

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target;

            if (
                target instanceof Node &&
                wrapperRef.current &&
                !wrapperRef.current.contains(target)
            ) {
                setOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, value]);

    const setYear = (year: number) => {
        onChange(Math.min(END_YEAR, Math.max(START_YEAR, year)));
        setOpen(false);
    };

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
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
                            ref={year === value ? selectedOptionRef : undefined}
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
