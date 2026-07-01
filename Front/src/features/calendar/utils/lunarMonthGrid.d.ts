import type { Language, LunarMonth } from '../types/calendar.types';

export interface LunarDayCell {
    key: string;
    isoDate: string | null;
    gregorianDay: number | null;
    lunarDay: number | null;
    isInLunarMonth: boolean;
    isToday: boolean;
}

export interface GregorianMonthSection {
    key: string;
    title: string;
    cells: LunarDayCell[];
}

export const DAY_HEADERS: Record<Language, string[]>;

export function parseIsoDate(value: string): Date;
export function toIsoDate(date: Date): string;
export function formatDisplayDate(isoDate: string): string;
export function daysBetween(start: Date, end: Date): number;
export function getTodayIsoDate(): string;
export function getLunarMonthStartDate(month: LunarMonth): string;
export function getLunarMonthEndDate(month: LunarMonth): string;
export function isLunarMonthArsar(month: LunarMonth): boolean;
export function formatKyrgyzEndingLunarMonthName(monthName: string): string;
export function getLunarMonthDays(month: LunarMonth): number;
export function formatLunarDayLabel(lunarDay: number, language?: Language): string;
export function findLunarMonthIndexByDate(months: LunarMonth[], isoDate?: string): number;

export interface LunarMonthTransition {
    endingMonthName: string;
    endingMonthDisplayNameKy: string;
    startingMonthName: string;
    visibleUntilDate: string | null;
    visibleUntilDisplayDate: string | null;
}

export function findLunarTransitionForNewMoon(
    months: LunarMonth[],
    isoDate: string
): LunarMonthTransition | null;

export function buildLunarMonthSections(
    month: LunarMonth,
    language?: Language,
    todayIso?: string
): GregorianMonthSection[];
