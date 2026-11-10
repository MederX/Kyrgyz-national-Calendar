import type { CalendarRequest } from '../features/calendar/types/calendar.types';
import { validateCalendarResponse } from './validateResponse.ts';

export interface LocalCalendarEngine {
    calculate(request: CalendarRequest): Promise<{ json: string }>;
}

export async function calculateLocalCalendar(engine: LocalCalendarEngine, request: CalendarRequest, signal?: AbortSignal) {
    signal?.throwIfAborted();
    const result = await engine.calculate(request);
    signal?.throwIfAborted();
    return validateCalendarResponse(JSON.parse(result.json), request.year);
}
