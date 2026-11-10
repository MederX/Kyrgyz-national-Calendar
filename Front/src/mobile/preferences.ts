import type { Language, LatLon } from '../features/calendar/types/calendar.types';

export interface MobilePreferences { language: Language; theme: 'light' | 'dark'; location: LatLon }
const KEY = 'kyrgyz-calendar-mobile-preferences-v1';
const defaultLocation: LatLon = { latitude: 42.8746, longitude: 74.5698, cityName: 'Бишкек', timeZone: 'Asia/Bishkek' };

function validLocation(value: unknown): value is LatLon {
    if (!value || typeof value !== 'object') return false;
    const location = value as LatLon;
    if (!Number.isFinite(location.latitude) || Math.abs(location.latitude) > 90 || !Number.isFinite(location.longitude) || Math.abs(location.longitude) > 180 || typeof location.cityName !== 'string' || !location.cityName.trim() || typeof location.timeZone !== 'string') return false;
    try { new Intl.DateTimeFormat('en', { timeZone: location.timeZone }); return true; } catch { return false; }
}

export function readPreferences(storage: Pick<Storage, 'getItem'>): MobilePreferences {
    let value: Partial<MobilePreferences> = {};
    try {
        const parsed = JSON.parse(storage.getItem(KEY) ?? '{}');
        if (parsed && typeof parsed === 'object') value = parsed;
    } catch { /* Storage is optional; the app remains usable. */ }
    return {
        language: value.language === 'ru' ? 'ru' : 'ky',
        theme: value.theme === 'dark' ? 'dark' : 'light',
        location: validLocation(value.location) ? value.location : { ...defaultLocation },
    };
}

export function savePreferences(storage: Pick<Storage, 'setItem'>, preferences: MobilePreferences): void {
    try { storage.setItem(KEY, JSON.stringify(preferences)); } catch { /* Private browsing or full storage must not block navigation. */ }
}
