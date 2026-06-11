import React from 'react';
import type { EventType } from '../types/calendar.types';

interface EventIconProps {
    type: EventType | 'multiple';
    className?: string;
}

export function getEventColorVar(type: EventType | 'multiple'): string {
    switch (type) {
        case 'nooruz':
            return 'var(--color-muchol)';
        case 'togool':
            return 'var(--color-togool)';
        case 'new_moon':
            return 'var(--color-new-moon)';
        case 'full_moon':
            return 'var(--color-full-moon)';
        case 'ramadan':
        case 'ai_bashi':
        case 'eid_al_fitr':
        case 'kurman_ait':
            return 'var(--color-islamic)';
        case 'kadyr_tun':
            return 'var(--color-kadyr)';
        case 'holiday':
            return 'var(--color-holiday)';
        case 'multiple':
            return 'var(--accent-gold)';
        default:
            return 'currentColor';
    }
}

export const EventIcon: React.FC<EventIconProps> = ({ type, className }) => {
    const common = {
        className,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.9,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        'aria-hidden': true,
    };

    if (type === 'nooruz') {
        return (
            <svg {...common}>
                <path d="M12 20V9" />
                <path d="M12 11c-4 0-6-2-6-6 4 0 6 2 6 6z" />
                <path d="M12 13c4 0 6-2 6-6-4 0-6 2-6 6z" />
            </svg>
        );
    }

    if (type === 'togool') {
        return (
            <svg {...common} fill="currentColor" stroke="none">
                <path d="M12 3l2.2 6.1L21 12l-6.8 2.9L12 21l-2.2-6.1L3 12l6.8-2.9L12 3z" />
                <circle cx="18" cy="6" r="1.2" />
                <circle cx="6" cy="7" r="1" />
            </svg>
        );
    }

    if (type === 'new_moon') {
        return (
            <svg {...common}>
                <path d="M15.5 4.5A8 8 0 1 0 19 18a7 7 0 1 1-3.5-13.5z" />
            </svg>
        );
    }

    if (type === 'full_moon') {
        return (
            <svg {...common} fill="currentColor" stroke="none">
                <circle cx="12" cy="12" r="7" />
            </svg>
        );
    }

    if (type === 'eid_al_fitr') {
        return (
            <svg {...common}>
                <path d="M15.5 4.5A8 8 0 1 0 19 18a7 7 0 1 1-3.5-13.5z" />
                <path
                    d="M18 6.2l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z"
                    fill="currentColor"
                    stroke="none"
                />
            </svg>
        );
    }

    if (type === 'kurman_ait') {
        return (
            <svg {...common}>
                <path d="M6 15c0-3 3-5 6-5s6 2 6 5-3 4-6 4-6-1-6-4z" />
                <path d="M16 10c2-2 4-1 4 1s-2 2-3 1" />
                <path d="M9 19v2M15 19v2" />
            </svg>
        );
    }

    if (type === 'kadyr_tun') {
        return (
            <svg {...common} fill="currentColor" stroke="none">
                <path d="M12 4l1.5 4.5H18l-3.6 2.6 1.4 4.4L12 12.8 8.2 15.5l1.4-4.4L6 8.5h4.5z" />
            </svg>
        );
    }

    if (type === 'holiday') {
        return (
            <svg {...common} fill="currentColor" stroke="none">
                <path d="M7 5h10l-2 4 2 4H7z" />
                <path d="M6 5h1v15H6z" />
            </svg>
        );
    }

    if (type === 'ramadan' || type === 'ai_bashi') {
        return (
            <svg {...common}>
                <path d="M15.5 4.5A8 8 0 1 0 19 18a7 7 0 1 1-3.5-13.5z" />
            </svg>
        );
    }

    return (
        <svg {...common}>
            <circle cx="12" cy="12" r="7" />
        </svg>
    );
};
