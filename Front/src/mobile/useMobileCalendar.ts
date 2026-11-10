import { useQuery } from '@tanstack/react-query';
import { getMobileCalendar } from './calendarEngine';
import { useCalendarStore } from '../features/calendar/store/calendarStore';
import type { CalendarResponse } from '../features/calendar/types/calendar.types';
import { FIRST_YEAR, LAST_YEAR, getRequiredContext } from './calendarModel';
import { validateCalendarResponse } from './validateResponse';

export function useMobileCalendar(isoDate: string, includeUpcoming = false, enabled = true) {
    const location = useCalendarStore(state => state.location);
    const year = Number(isoDate.slice(0, 4));
    const options = (year: number, enabled: boolean) => ({
        queryKey: ['calendar-events', year, location.latitude, location.longitude, location.timeZone],
        queryFn: async ({ signal }: { signal: AbortSignal }) => {
            const data = await getMobileCalendar({ year, latitude: location.latitude, longitude: location.longitude, tz_name: location.timeZone }, signal);
            return validateCalendarResponse(data, year);
        },
        staleTime: 10 * 60 * 1000,
        retry: 1,
        networkMode: 'always' as const,
        enabled: enabled && year >= FIRST_YEAR && year <= LAST_YEAR,
    });
    const current = useQuery(options(year, enabled));
    const required = current.data ? getRequiredContext(current.data, isoDate, includeUpcoming) : [];
    const previous = useQuery(options(year - 1, enabled && required.includes(year - 1)));
    const next = useQuery(options(year + 1, enabled && required.includes(year + 1)));
    const active = [current, ...(required.includes(year - 1) ? [previous] : []), ...(required.includes(year + 1) ? [next] : [])];
    return {
        responses: active.map(query => query.data).filter((data): data is CalendarResponse => Boolean(data)),
        isLoading: enabled && active.some(query => query.isPending),
        isError: active.some(query => query.isError),
        retry: () => { active.forEach(query => { void query.refetch(); }); },
    };
}
