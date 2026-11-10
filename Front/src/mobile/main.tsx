import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCalendarStore } from '../features/calendar/store/calendarStore';
import { MobileApp, browserStorage } from './MobileApp';
import { readPreferences } from './preferences';
import '../core/theme/theme.css';
import './mobileTypography.css';

const preferences = readPreferences(browserStorage);
useCalendarStore.setState({ language: preferences.language, location: preferences.location });
const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><QueryClientProvider client={queryClient}><MobileApp preferences={preferences} /></QueryClientProvider></React.StrictMode>);
