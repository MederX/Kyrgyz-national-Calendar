import { Capacitor, registerPlugin } from '@capacitor/core';
import type { CalendarRequest } from '../features/calendar/types/calendar.types';
import { calculateLocalCalendar, type LocalCalendarEngine } from './calendarTransport';

const engine = registerPlugin<LocalCalendarEngine>('CalendarEngine');

export async function getMobileCalendar(request: CalendarRequest, signal?: AbortSignal) {
    if (Capacitor.isNativePlatform()) return calculateLocalCalendar(engine, request, signal);
    // The browser development preview retains its local Python adapter.
    // Vite removes this entire branch and its HTTP import from packaged builds.
    if (import.meta.env.DEV) {
        const { fetchCalendarEvents } = await import('../features/calendar/api/calendarApi');
        return fetchCalendarEvents(request, signal);
    }
    throw new Error('The embedded calendar requires the Android application');
}
