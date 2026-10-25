import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';

/** Keep an anchored menu in the visible viewport, including short landscape windows. */
export function useViewportMenu(open: boolean, anchorRef: RefObject<HTMLElement>) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<CSSProperties>();

    useLayoutEffect(() => {
        if (!open) return;
        const viewport = window.visualViewport;
        const update = () => {
            const anchor = anchorRef.current;
            if (!anchor) return;
            const rect = anchor.getBoundingClientRect();
            const viewportTop = viewport?.offsetTop ?? 0;
            const viewportLeft = viewport?.offsetLeft ?? 0;
            const viewportHeight = viewport?.height ?? window.innerHeight;
            const viewportWidth = viewport?.width ?? window.innerWidth;
            const rootStyle = getComputedStyle(document.documentElement);
            const safe = (side: string) => parseFloat(rootStyle.getPropertyValue(`--safe-area-${side}`)) || 0;
            const margin = 12;
            const gap = 8;
            const above = rect.top - viewportTop - safe('top') - margin - gap;
            const below = viewportTop + viewportHeight - safe('bottom') - rect.bottom - margin - gap;
            const opensAbove = above > below;
            const maxHeight = Math.min(320, Math.max(0, opensAbove ? above : below));
            const width = Math.min(rect.width, viewportWidth - margin * 2 - safe('left') - safe('right'));
            const left = Math.max(viewportLeft + safe('left') + margin, Math.min(rect.left, viewportLeft + viewportWidth - safe('right') - width - margin));
            setStyle({
                position: 'fixed', left, right: 'auto', width, maxHeight,
                top: opensAbove ? 'auto' : Math.max(viewportTop + margin, rect.bottom + gap),
                bottom: opensAbove ? window.innerHeight - rect.top + gap : 'auto',
            });
        };
        update();
        window.addEventListener('resize', update);
        document.addEventListener('scroll', update, true);
        viewport?.addEventListener('resize', update);
        viewport?.addEventListener('scroll', update);
        return () => {
            window.removeEventListener('resize', update);
            document.removeEventListener('scroll', update, true);
            viewport?.removeEventListener('resize', update);
            viewport?.removeEventListener('scroll', update);
        };
    }, [open, anchorRef]);

    return { menuRef, menuStyle: style };
}

export function centerMenuOption(option: HTMLElement | null, menu: HTMLElement | null) {
    if (!option || !menu) return;
    // Scroll only this list: scrollIntoView can unexpectedly move the entire page.
    const offset = option.getBoundingClientRect().top - menu.getBoundingClientRect().top + menu.scrollTop;
    menu.scrollTop = offset - (menu.clientHeight - option.offsetHeight) / 2;
}
