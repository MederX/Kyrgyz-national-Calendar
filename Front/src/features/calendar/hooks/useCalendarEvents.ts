import { useQuery } from '@tanstack/react-query';
import { fetchCalendarEvents } from '../api/calendarApi';
import { useCalendarStore } from '../store/calendarStore';

export function useCalendarEvents() {
    const { selectedYear, location } = useCalendarStore();

    return useQuery({
        queryKey: [
            'calendar-events',
            selectedYear,
            location.latitude,
            location.longitude,
            location.timeZone,
        ],
        queryFn: () =>
            fetchCalendarEvents({
                year: selectedYear,
                latitude: location.latitude,
                longitude: location.longitude,
                tz_name: location.timeZone,
            }),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}
