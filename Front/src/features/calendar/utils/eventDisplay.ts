import type { CalendarEvent, EventType } from '../types/calendar.types';

const EVENT_PRIORITY: Record<EventType, number> = {
    nooruz: 1,
    togool: 2,
    new_moon: 3,
    full_moon: 3,
    kadyr_tun: 4,
    ai_bashi: 4,
    eid_al_fitr: 4,
    kurman_ait: 4,
    ramadan: 4,
    holiday: 5,
};

export function getEventPriority(type: EventType): number {
    return EVENT_PRIORITY[type] ?? 99;
}

export function sortEventsByDisplayPriority(
    events: CalendarEvent[]
): CalendarEvent[] {
    return [...events].sort((a, b) => {
        const priorityDiff = getEventPriority(a.type) - getEventPriority(b.type);
        if (priorityDiff !== 0) return priorityDiff;
        return a.time.localeCompare(b.time);
    });
}

export function selectPrimaryCalendarEvent(
    events: CalendarEvent[]
): CalendarEvent | null {
    if (events.length === 0) return null;
    return sortEventsByDisplayPriority(events)[0];
}

export function getAdditionalEventCount(events: CalendarEvent[]): number {
    return Math.max(0, events.length - 1);
}

export function splitAiBashyNote(events: CalendarEvent[]): {
    visibleEvents: CalendarEvent[];
    aiBashyNote: CalendarEvent | null;
} {
    const hasNewMoon = events.some((event) => event.type === 'new_moon');
    const aiBashy = events.find((event) => event.type === 'ai_bashi') ?? null;

    if (!hasNewMoon || aiBashy === null) {
        return { visibleEvents: events, aiBashyNote: null };
    }

    return {
        visibleEvents: events.filter((event) => event.type !== 'ai_bashi'),
        aiBashyNote: aiBashy,
    };
}
