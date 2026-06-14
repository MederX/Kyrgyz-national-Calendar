export type EventType = 'new_moon' | 'full_moon' | 'togool' | 'nooruz' | 'holiday' | 'eid_al_fitr' | 'ramadan' | 'kadyr_tun' | 'ai_bashi' | 'kurman_ait';
export type Language = 'ky' | 'ru';
export type PeriodType = 'ramadan';

export interface CalendarEvent {
    date: string;        // "2025-06-18"
    time: string;        // "20:45"
    type: EventType;
    label_ky: string;
    label_ru: string;
    description_ky: string;
    description_ru: string;
    tips_ky?: string;
    tips_ru?: string;
}

export interface CalendarResponse {
    year: number;
    month: number | null;
    events: CalendarEvent[];
    periods: CalendarPeriod[];
    lunar_months: LunarMonth[];
}

export interface CalendarRequest {
    year: number;
    month?: number;
    latitude: number;
    longitude: number;
    elevation_m?: number;
    tz_name?: string;
}

export interface LatLon {
    latitude: number;
    longitude: number;
    cityName: string;
    timeZone: string;
}

export interface CalendarPeriod {
    start_date: string;
    end_date: string;
    type: PeriodType;
    label_ky: string;
    label_ru: string;
    description_ky: string;
    description_ru: string;
}

export interface LunarMonth {
    lunar_year: number;
    sequence: number;
    name: string;
    base_name: string | null;
    start_date: string;
    end_date: string;
    start_datetime: string;
    end_datetime: string;
    next_new_moon_datetime: string;
    days: number;
    is_arsar: boolean;
    arsar_of: string | null;
    status: string;
    season_month: number | null;
    overlap_days: number;
}
