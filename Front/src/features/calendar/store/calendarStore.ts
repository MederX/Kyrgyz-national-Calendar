import { create } from 'zustand';
import type { LatLon, Language } from '../types/calendar.types';

interface CalendarStore {
    selectedYear: number;
    location: LatLon;
    language: Language;
    setSelectedYear: (year: number) => void;
    setLocation: (loc: LatLon) => void;
    setLanguage: (lang: Language) => void;
}

export const useCalendarStore = create<CalendarStore>((set) => ({
    selectedYear: new Date().getFullYear(),
    location: {
        latitude: 42.8746,
        longitude: 74.5698,
        cityName: 'Бишкек',
        timeZone: 'Asia/Bishkek',
    },
    language: 'ky',

    setSelectedYear: (year) => set({ selectedYear: year }),
    setLocation: (loc) => set({ location: loc }),
    setLanguage: (lang) => set({ language: lang }),
}));
