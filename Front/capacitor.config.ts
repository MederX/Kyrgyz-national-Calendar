import type { CapacitorConfig } from '@capacitor/cli';
import { CALENDAR_TITLES } from './src/features/calendar/utils/calendarCopy';

const config: CapacitorConfig = {
    // Development identifier. Set an owned identifier before a store release.
    appId: process.env.CAPACITOR_APP_ID || 'org.example.kyrgyzcalendar',
    appName: CALENDAR_TITLES.ky,
    webDir: 'dist-mobile',
    backgroundColor: '#F6F1E7',
    android: { allowMixedContent: false, backgroundColor: '#F6F1E7' },
    plugins: { SystemBars: { insetsHandling: 'native', initialViewportFitValueHint: 'cover', style: 'DEFAULT' } },
};
export default config;
