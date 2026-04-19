import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CalendarScreen } from './features/calendar/components/CalendarScreen';

const queryClient = new QueryClient();

const App: React.FC = () => (
    <QueryClientProvider client={queryClient}>
        <CalendarScreen />
    </QueryClientProvider>
);

export default App;
