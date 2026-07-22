import React, { useState, useEffect, useMemo } from 'react';
import { useCalendarStore } from '../store/calendarStore';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { MonthCalendarGrid } from './MonthCalendarGrid';
import { EventDetailSheet } from './EventDetailSheet';
import { EventLegend } from './EventLegend';
import { LocationSelector } from './LocationSelector';
import { YearControl } from './YearControl';
import { LunarMonthCalendarView } from './LunarMonthCalendarView';
import { SiteFooter } from './SiteFooter';
import type { CalendarEvent, CalendarPeriod } from '../types/calendar.types';
import styles from './CalendarScreen.module.css';

const MONTH_NAMES_KY = [
    'Бирдин айы (январь)',
    'Жалган куран (февраль)',
    'Чын куран (март)',
    'Бугу (апрель)',
    'Кулжа (май)',
    'Теке (июнь)',
    'Баш оона (июль)',
    'Аяк оона (август)',
    'Тогуздун айы (сентябрь)',
    'Жетинин айы (октябрь)',
    'Бештин айы (ноябрь)',
    'Үчтүн айы (декабрь)'
];

const MONTH_NAMES_RU = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const MONTH_NAMES_RU_GENITIVE = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

const KY_DAY_NAMES = [
    '', 'бири', 'экиси', 'үчү', 'төртү', 'беши', 'алтысы', 'жетиси', 'сегизи', 'тогузу', 'ону',
    'он бири', 'он экиси', 'он үчү', 'он төртү', 'он беши', 'он алтысы', 'он жетиси', 'он сегизи', 'он тогузу', 'жыйырмасы',
    'жыйырма бири', 'жыйырма экиси', 'жыйырма үчү', 'жыйырма төртү', 'жыйырма беши', 'жыйырма алтысы', 'жыйырма жетиси', 'жыйырма сегизи', 'жыйырма тогузу', 'отузу',
    'отуз бири'
];

const ANIMAL_NAMES_KY = [
    'Чычкан', 'Уй', 'Жолборс', 'Коён', 'Балык', 'Жылан', 'Жылкы', 'Кой', 'Маймыл', 'Тоок', 'Ит', 'Доңуз'
];

const ANIMAL_NAMES_RU = [
    'Мышь', 'Корова', 'Тигр', 'Заяц', 'Рыба', 'Змея', 'Лошадь', 'Овца', 'Обезьяна', 'Петух', 'Собака', 'Кабан'
];

const ANIMAL_YEAR_NAMES_RU = [
    'Год мыши', 'Год коровы', 'Год тигра', 'Год зайца', 'Год рыбы', 'Год змеи',
    'Год лошади', 'Год овцы', 'Год обезьяны', 'Год петуха', 'Год собаки', 'Год кабана'
];

const ANIMAL_EMOJIS = [
    '🐭', '🐄', '🐅', '🐇', '🐟', '🐍', '🐎', '🐑', '🐒', '🐓', '🐕', '🐗'
];

const getKyMonthGenitive = (monthIndex: number) => {
    const baseMonth = MONTH_NAMES_KY[monthIndex].split('(')[0].trim();
    return baseMonth.endsWith('айы')
        ? baseMonth.replace('айы', 'айынын')
        : `${baseMonth} айынын`;
};

const formatKyFullDate = (date: Date) => {
    return `${getKyMonthGenitive(date.getUTCMonth())} ${KY_DAY_NAMES[date.getUTCDate()]}`;
};

const formatLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const CalendarScreen: React.FC = () => {
    const {
        selectedYear,
        setSelectedYear,
        location,
        setLocation,
        language,
        setLanguage,
    } = useCalendarStore();

    const { data, isLoading, isError } = useCalendarEvents();

    const [showLocation, setShowLocation] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const events = data?.events ?? [];
    const periods = data?.periods ?? [];
    const lunarMonths = data?.lunar_months ?? [];
    const todayDateStr = useMemo(() => formatLocalDateString(new Date()), []);

    const handleDayClick = (year: number, month: number, day: number) => {
        const mm = String(month).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        setSelectedDateStr(`${year}-${mm}-${dd}`);
    };

    const selectedDayEvents = useMemo(() => {
        if (!selectedDateStr) return [];
        const dateEvents = events.filter((e: CalendarEvent) => e.date === selectedDateStr);
        const periodEvents = periods
            .filter((period: CalendarPeriod) => period.start_date <= selectedDateStr && period.end_date >= selectedDateStr)
            .map((period: CalendarPeriod) => ({
                date: selectedDateStr,
                time: '',
                type: 'ramadan' as const,
                label_ky: period.label_ky,
                label_ru: period.label_ru,
                description_ky: period.description_ky,
                description_ru: period.description_ru,
                tips_ky: undefined,
                tips_ru: undefined,
            }));

        return [...dateEvents, ...periodEvents];
    }, [selectedDateStr, events, periods]);

    const selectedDateLabel = useMemo(() => {
        if (!selectedDateStr) return '';
        const [, m, d] = selectedDateStr.split('-').map(Number);

        if (language === 'ky') {
            return `${getKyMonthGenitive(m - 1)} ${KY_DAY_NAMES[d]}`;
        }

        return `${d} ${MONTH_NAMES_RU_GENITIVE[m - 1]}`;
    }, [selectedDateStr, language]);

    const isSelectedEmptyToday = selectedDateStr === todayDateStr && selectedDayEvents.length === 0;
    const selectedSheetTitle = isSelectedEmptyToday
        ? `${language === 'ky' ? 'Бүгүнкү күн' : 'Сегодняшняя дата'}: ${selectedDateLabel}`
        : selectedDateLabel;

    const animalIndex = (selectedYear - 4) % 12;
    const animalEmoji = ANIMAL_EMOJIS[animalIndex];
    const animalYearLabel = language === 'ky'
        ? `${ANIMAL_NAMES_KY[animalIndex]} жылы`
        : ANIMAL_YEAR_NAMES_RU[animalIndex];
    const getAnimalLabelForYear = (year: number) => {
        const index = (year - 4) % 12;
        return language === 'ky' ? ANIMAL_NAMES_KY[index] : ANIMAL_NAMES_RU[index];
    };
    const ramadanSummary = useMemo(() => {
        if (periods.length === 0) {
            return null;
        }

        const formatter = new Intl.DateTimeFormat(language === 'ky' ? 'ky-KG' : 'ru-RU', {
            day: 'numeric',
            month: 'long',
            timeZone: 'UTC',
        });

        return periods.map((period: CalendarPeriod) => {
            const startDate = new Date(`${period.start_date}T00:00:00Z`);
            const endDate = new Date(`${period.end_date}T00:00:00Z`);

            if (language === 'ky') {
                return `${formatKyFullDate(startDate)} - ${formatKyFullDate(endDate)}`;
            }

            return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
        }).join(', ');
    }, [language, periods]);

    const monthRamadanLabels = useMemo(() => {
        const formatter = new Intl.DateTimeFormat(language === 'ky' ? 'ky-KG' : 'ru-RU', {
            day: 'numeric',
            timeZone: 'UTC',
        });

        return Array.from({ length: 12 }, (_, monthIndex) => {
            const monthStr = String(monthIndex + 1).padStart(2, '0');
            const matchingPeriods = periods.filter((period: CalendarPeriod) =>
                period.type === 'ramadan' &&
                (period.start_date.slice(5, 7) === monthStr || period.end_date.slice(5, 7) === monthStr)
            );

            if (matchingPeriods.length === 0) {
                return null;
            }

            return matchingPeriods.map((period: CalendarPeriod) => {
                const startDate = period.start_date.slice(5, 7) === monthStr
                    ? new Date(`${period.start_date}T00:00:00Z`)
                    : new Date(`${selectedYear}-${monthStr}-01T00:00:00Z`);
                const endDate = period.end_date.slice(5, 7) === monthStr
                    ? new Date(`${period.end_date}T00:00:00Z`)
                    : new Date(`${selectedYear}-${monthStr}-${new Date(selectedYear, monthIndex + 1, 0).getDate()}T00:00:00Z`);

                return `${formatter.format(startDate)}-${formatter.format(endDate)}`;
            }).join(', ');
        });
    }, [language, periods, selectedYear]);

    return (
        <div className={styles.container}>
            <div className={styles.bgWatermark}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M 8 4 Q 12 11 16 4 M 6 6 Q 12 13 18 6 M 8 20 Q 12 13 16 20 M 6 18 Q 12 11 18 18" />
                    <path d="M 4 8 Q 11 12 4 16 M 6 6 Q 13 12 6 18 M 20 8 Q 13 12 20 16 M 18 6 Q 11 12 18 18" />
                </svg>
            </div>
            <div className={styles.bgGlow} />

            <header className={styles.header}>
                <div className={styles.headerText}>
                    <h1 className={styles.title}>
                        {language === 'ky' ? 'Кыргыз Элинин Улуттук ай күн календары' : 'Кыргызский национальный календарь'}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '10px' }}>
                        <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-gold)', fontFamily: 'var(--font-family-serif)', lineHeight: 1 }}>
                            {selectedYear}
                        </span>
                        <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                            · {animalYearLabel} <span aria-hidden="true">{animalEmoji}</span>
                        </span>
                    </div>
                </div>

                <div className={styles.controls}>
                    <YearControl
                        value={selectedYear}
                        onChange={setSelectedYear}
                        language={language}
                        getAnimalLabel={getAnimalLabelForYear}
                    />
                    <button
                        className={styles.themeToggle}
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        title={language === 'ky' ? 'Теманы алмаштыруу' : 'Сменить тему'}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <button
                        className={styles.langToggle}
                        onClick={() => setLanguage(language === 'ky' ? 'ru' : 'ky')}
                    >
                        {language === 'ky' ? 'РУС' : 'КЫР'}
                    </button>
                </div>
            </header>

            {ramadanSummary && (
                <div className={styles.yearInfoBar}>
                    <span className={styles.yearInfoLabel}>
                        {language === 'ky' ? 'Рамазан:' : 'Рамазан:'}
                    </span>
                    <span className={styles.yearInfoValue}>{ramadanSummary}</span>
                </div>
            )}

            {isOffline && (
                <div className={styles.offlineBadge}>
                    {language === 'ky' ? 'Офлайн режим' : 'Офлайн режим'}
                </div>
            )}

            <button
                className={styles.locationRow}
                onClick={() => setShowLocation(true)}
            >
                <span className={styles.locationIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" />
                        <circle cx="12" cy="9" r="2.5" />
                    </svg>
                </span>
                <span className={styles.locationName}>{location.cityName}</span>
                <span className={styles.locationChevron}>›</span>
            </button>

            <div className={styles.legendWrapper}>
                <EventLegend language={language} />
            </div>

            <section className={`${styles.calendarSection} ${styles.solarSection}`}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionIcon} aria-hidden="true">☀</div>
                    <div>
                        <h2 className={styles.sectionTitle}>
                            {language === 'ky' ? 'Күн календары' : 'Солнечный календарь'}
                        </h2>
                        <p className={styles.sectionSubtitle}>
                            {language === 'ky'
                                ? 'Кадимки жылдык календарь: Бирдин айы - Үчтүн айы'
                                : 'Обычный годовой календарь: январь - декабрь'}
                        </p>
                    </div>
                </div>

                <div className={styles.yearGrid}>
                    {isLoading ? (
                        Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className={`${styles.monthCard} skeleton`} style={{ height: '280px' }} />
                        ))
                    ) : isError ? (
                        <div className={styles.errorState}>
                            <span>
                                {language === 'ky'
                                    ? '⚠️ Маалымат жүктөөдө ката кетти'
                                    : '⚠️ Ошибка загрузки данных'}
                            </span>
                        </div>
                    ) : (
                        MONTH_NAMES_KY.map((monthNameKy, monthIndex) => {
                            const mLabel = language === 'ky' ? monthNameKy : MONTH_NAMES_RU[monthIndex];
                            const monthDate = new Date(selectedYear, monthIndex);

                            return (
                                <div key={monthIndex} className={styles.monthCard}>
                                    <div className={styles.monthHeaderRow}>
                                        <div className={styles.monthHeader}>{mLabel}</div>
                                        {monthRamadanLabels[monthIndex] && (
                                            <span className={styles.monthPeriodBadge}>
                                                {language === 'ky' ? 'Рамазан' : 'Рамазан'} {monthRamadanLabels[monthIndex]}
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.gridWrapper}>
                                        <MonthCalendarGrid
                                            events={events}
                                            periods={periods}
                                            selectedMonth={monthDate}
                                            language={language}
                                            onDayClick={(day) => handleDayClick(selectedYear, monthIndex + 1, day)}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>

            {!isLoading && !isError && lunarMonths.length > 0 && (
                <section className={`${styles.calendarSection} ${styles.lunarSection}`}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionIcon} aria-hidden="true">☾</div>
                        <div>
                            <h2 className={styles.sectionTitle}>
                                {language === 'ky' ? 'Ай календары' : 'Лунный календарь'}
                            </h2>
                            <p className={styles.sectionSubtitle}>
                                {language === 'ky'
                                    ? 'Ай жаңыргандан ай жаңырганга чейинки күндөр'
                                    : 'Дни от новолуния до новолуния'}
                            </p>
                        </div>
                    </div>
                    <LunarMonthCalendarView
                        months={lunarMonths}
                        language={language}
                    />
                </section>
            )}

            <SiteFooter language={language} />

            {showLocation && (
                <LocationSelector
                    currentLocation={location}
                    onSelect={setLocation}
                    onClose={() => setShowLocation(false)}
                    language={language}
                />
            )}

            {selectedDateStr !== null && (selectedDayEvents.length > 0 || isSelectedEmptyToday) && (
                <EventDetailSheet
                    events={selectedDayEvents}
                    date={selectedSheetTitle}
                    onClose={() => setSelectedDateStr(null)}
                    language={language}
                    lunarMonths={lunarMonths}
                />
            )}
        </div>
    );
};
