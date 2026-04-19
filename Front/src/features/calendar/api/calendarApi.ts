import axios from 'axios';
import { API_BASE_URL } from '../../../core/constants/apiConstants';
import type { CalendarRequest, CalendarResponse } from '../types/calendar.types';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

export async function fetchCalendarEvents(
    req: CalendarRequest
): Promise<CalendarResponse> {
    const { data } = await api.post<CalendarResponse>('/calendar/events', req);
    return data;
}
