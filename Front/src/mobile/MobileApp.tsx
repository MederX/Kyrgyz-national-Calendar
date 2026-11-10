import { useEffect, useRef, useState } from 'react';
import { useCalendarStore } from '../features/calendar/store/calendarStore';
import type { CalendarEvent } from '../features/calendar/types/calendar.types';
import { CALENDAR_TITLES, getKyMonthGenitive, KY_DAY_NAMES } from '../features/calendar/utils/calendarCopy';
import { CalendarDialog, CalendarDialogPresentation } from '../features/calendar/components/CalendarDialog';
import { EventDetailSheet } from '../features/calendar/components/EventDetailSheet';
import { ArsarInfoModal } from '../features/calendar/components/ArsarInfoModal';
import { MucholInfoModal } from '../features/calendar/components/MucholInfoModal';
import { TogoolInfoModal } from '../features/calendar/components/TogoolInfoModal';
import { LocationSelector } from '../features/calendar/components/LocationSelector';
import { TodayView } from './TodayView';
import { CalendarView, type CalendarMode } from './CalendarView';
import { GuideView, type InfoKind } from './GuideView';
import { MobileIcon, type MobileIconName } from './MobileIcon';
import { CalendarLogo } from './CalendarLogo';
import { mobileCopy } from './mobileCopy';
import { formatGmtOffset } from './mobileFormatting';
import { useMobileCalendar } from './useMobileCalendar';
import { clampDate, getDateInTimeZone, getDayEvents, getEventDetailEvents, mergeLunarMonths, parseDate } from './calendarModel';
import { savePreferences, type MobilePreferences } from './preferences';
import { useNativeLifecycle, getNativeCoordinates } from './native';
import styles from './MobileApp.module.css';

type Tab = 'today' | 'calendar' | 'guide';
type Modal = { type: 'event'; event: Pick<CalendarEvent, 'date' | 'type' | 'time'> } | { type: 'info'; kind: InfoKind } | { type: 'location' } | null;

export const browserStorage = { getItem: (key: string) => localStorage.getItem(key), setItem: (key: string, value: string) => localStorage.setItem(key, value) };

function DataState({ loading, error, retry, language }: { loading: boolean; error: boolean; retry: () => void; language: 'ky' | 'ru' }) {
    const t = mobileCopy[language];
    return <div className={styles.dataState} role={error ? 'alert' : 'status'} aria-live="polite"><p>{error ? t.error : loading ? t.loading : ''}</p>{error && <button className={styles.retryButton} onClick={retry}>{t.retry}</button>}</div>;
}

export function MobileApp({ preferences }: { preferences: MobilePreferences }) {
    const { language, location, setLanguage, setLocation, setSelectedYear } = useCalendarStore();
    const [theme, setTheme] = useState(preferences.theme);
    const [now, setNow] = useState(() => new Date());
    const today = getDateInTimeZone(now, location.timeZone);
    const [date, setDate] = useState(() => clampDate(today));
    const [tab, setTab] = useState<Tab>('today');
    const [mode, setMode] = useState<CalendarMode>('solar');
    const [modal, setModal] = useState<Modal>(null);
    const content = useRef<HTMLElement>(null);
    const t = mobileCopy[language];
    const todayData = useMobileCalendar(today, true);
    const calendarData = useMobileCalendar(date, false, tab === 'calendar');
    const detailData = useMobileCalendar(modal?.type === 'event' ? modal.event.date : today, false, modal?.type === 'event');

    useEffect(() => {
        const update = () => { setNow(new Date()); };
        const timer = window.setInterval(update, 30_000);
        window.addEventListener('focus', update);
        window.addEventListener('online', update);
        window.addEventListener('offline', update);
        document.addEventListener('visibilitychange', update);
        return () => { clearInterval(timer); window.removeEventListener('focus', update); window.removeEventListener('online', update); window.removeEventListener('offline', update); document.removeEventListener('visibilitychange', update); };
    }, []);
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.lang = language;
        document.title = CALENDAR_TITLES[language];
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#F6F1E7' : '#0A141B');
        savePreferences(browserStorage, { language, theme, location });
    }, [language, theme, location]);
    useEffect(() => { setSelectedYear(Number(date.slice(0, 4))); }, [date, setSelectedYear]);
    useEffect(() => { content.current?.scrollTo({ top: 0 }); }, [tab]);

    useNativeLifecycle(() => {
        if (modal) { setModal(null); return true; }
        if (mode === 'year' && tab === 'calendar') { setMode('solar'); return true; }
        if (tab !== 'today') { setTab('today'); return true; }
        return false;
    }, () => setNow(new Date()), theme);

    const selectDate = (value: string) => setDate(clampDate(value));
    const openCalendar = (value: string, targetMode: CalendarMode = 'solar') => { selectDate(value); setMode(targetMode); setTab('calendar'); };
    const openEvent = (event: CalendarEvent) => setModal({ type: 'event', event });
    const activeData = tab === 'today' ? todayData : calendarData;
    const eventDate = modal?.type === 'event' ? modal.event.date : today;
    const parsed = parseDate(eventDate);
    const eventDateLabel = language === 'ky' ? `${getKyMonthGenitive(parsed.getUTCMonth())} ${KY_DAY_NAMES[parsed.getUTCDate()]}` : new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(parsed);

    return <CalendarDialogPresentation.Provider value="sheet"><div className={styles.app} data-mobile-app>
        <header className={styles.header}>
            <div className={styles.brand}><CalendarLogo /><p className={styles.brandTitle}>{CALENDAR_TITLES[language]}</p></div>
            <div className={styles.headerControls}><button className={styles.locationButton} onClick={() => setModal({ type: 'location' })}><MobileIcon name="pin" /><span>{location.cityName} · <span className={styles.locationOffset}>{formatGmtOffset(location.timeZone, now)}</span></span><MobileIcon name="chevron" /></button>
                <div className={styles.headerActions}><button className={styles.iconButton} aria-label={t.switchLanguage} onClick={() => setLanguage(language === 'ky' ? 'ru' : 'ky')} data-language>{language === 'ky' ? 'РУС' : 'КЫР'}</button><button className={styles.iconButton} aria-label={t.switchTheme} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} data-theme-toggle><MobileIcon name={theme === 'light' ? 'moon' : 'sun'} /></button></div>
            </div>
        </header>
        <main className={styles.content} ref={content}>
            {tab !== 'guide' && (activeData.isLoading || activeData.isError) ? <DataState loading={activeData.isLoading} error={activeData.isError} retry={activeData.retry} language={language} /> : <>
                {tab === 'today' && <TodayView date={today} now={now} latitude={location.latitude} responses={todayData.responses} language={language} onOpenEvent={openEvent} onCalendar={openCalendar} />}
                {tab === 'calendar' && <CalendarView date={date} today={today} responses={calendarData.responses} language={language} mode={mode} onMode={setMode} onSelect={selectDate} onOpenEvent={openEvent} />}
                {tab === 'guide' && <GuideView language={language} onOpen={kind => setModal({ type: 'info', kind })} />}
            </>}
        </main>
        <nav className={styles.dock} aria-label={language === 'ky' ? 'Колдонмонун бөлүмдөрү' : 'Разделы приложения'}>
            {(['today', 'calendar', 'guide'] as Tab[]).map(id => <button key={id} aria-current={tab === id ? 'page' : undefined} className={`${styles.navItem} ${tab === id ? styles.activeNav : ''}`} onClick={() => setTab(id)} data-nav={id}><MobileIcon name={({ today: 'sun', calendar: 'calendar', guide: 'book' } as Record<Tab, MobileIconName>)[id]} /><span>{t[id]}</span></button>)}
        </nav>
        {modal?.type === 'event' && (detailData.isLoading || detailData.isError ? <CalendarDialog title={eventDateLabel} language={language} onClose={() => setModal(null)}><DataState loading={detailData.isLoading} error={detailData.isError} retry={detailData.retry} language={language} /></CalendarDialog> : <EventDetailSheet date={eventDateLabel} events={getEventDetailEvents(getDayEvents(detailData.responses, modal.event.date), modal.event)} language={language} onClose={() => setModal(null)} lunarMonths={mergeLunarMonths(detailData.responses)} />)}
        {modal?.type === 'info' && modal.kind === 'muchol' && <MucholInfoModal language={language} onClose={() => setModal(null)} />}
        {modal?.type === 'info' && modal.kind === 'arsar' && <ArsarInfoModal language={language} onClose={() => setModal(null)} />}
        {modal?.type === 'info' && modal.kind === 'togool' && <TogoolInfoModal language={language} onClose={() => setModal(null)} />}
        {modal?.type === 'location' && <LocationSelector currentLocation={location} language={language} onSelect={setLocation} onClose={() => setModal(null)} getCoordinates={getNativeCoordinates} reverseGeocode={false} />}
    </div></CalendarDialogPresentation.Provider>;
}
