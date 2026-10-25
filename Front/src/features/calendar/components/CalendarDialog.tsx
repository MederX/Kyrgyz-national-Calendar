import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Language } from '../types/calendar.types';
import styles from './CalendarDialog.module.css';

interface Props {
    title: string;
    language: Language;
    onClose: () => void;
    children: ReactNode;
    width?: number;
    bodyClassName?: string;
}

/** One viewport and scroll contract for event, terminology and location dialogs. */
export function CalendarDialog({ title, language, onClose, children, width = 460, bodyClassName }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = dialogRef.current!;
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        const viewport = window.visualViewport;
        const updateViewport = () => {
            dialog.style.setProperty('--viewport-height', `${viewport?.height ?? window.innerHeight}px`);
            dialog.style.setProperty('--viewport-width', `${viewport?.width ?? window.innerWidth}px`);
            dialog.style.setProperty('--viewport-top', `${viewport?.offsetTop ?? 0}px`);
            dialog.style.setProperty('--viewport-left', `${viewport?.offsetLeft ?? 0}px`);
        };
        updateViewport();
        dialog.showModal();
        document.body.style.overflow = 'hidden';
        window.addEventListener('resize', updateViewport);
        viewport?.addEventListener('resize', updateViewport);
        viewport?.addEventListener('scroll', updateViewport);
        return () => {
            window.removeEventListener('resize', updateViewport);
            viewport?.removeEventListener('resize', updateViewport);
            viewport?.removeEventListener('scroll', updateViewport);
            dialog.close();
            document.body.style.overflow = previousOverflow;
            if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
                previousFocus.focus({ preventScroll: true });
            }
        };
    }, []);

    return createPortal(
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            style={{ '--dialog-width': `${width}px` } as CSSProperties}
            aria-labelledby={titleId}
            aria-modal="true"
            onCancel={(event) => { event.preventDefault(); onClose(); }}
            onKeyDown={(event) => {
                if (event.key !== 'Tab') return;
                const controls = [...event.currentTarget.querySelectorAll<HTMLElement>(
                    'button:not(:disabled), input:not(:disabled), a[href], [tabindex="0"]',
                )].filter(element => element.getClientRects().length > 0);
                const first = controls[0];
                const last = controls[controls.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last?.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first?.focus();
                }
            }}
            onClick={(event) => {
                if (event.target !== event.currentTarget) return;
                const rect = event.currentTarget.getBoundingClientRect();
                if (event.clientX < rect.left || event.clientX > rect.right ||
                    event.clientY < rect.top || event.clientY > rect.bottom) onClose();
            }}
        >
            <div className={styles.header}>
                <h3 id={titleId} className={styles.title}>{title}</h3>
                <button
                    type="button"
                    className={styles.closeBtn}
                    onClick={onClose}
                    aria-label={language === 'ky' ? 'Жабуу' : 'Закрыть'}
                    autoFocus
                >✕</button>
            </div>
            <div className={`${styles.body} ${bodyClassName ?? ''}`} data-dialog-body>
                {children}
            </div>
        </dialog>,
        document.body,
    );
}
