import type { Language } from '../features/calendar/types/calendar.types';
import { EventIcon, getEventColorVar } from '../features/calendar/components/EventIcon';
import { MobileIcon } from './MobileIcon';
import { MobileGuideFooter } from './MobileGuideFooter';
import { mobileCopy } from './mobileCopy';
import styles from './MobileApp.module.css';

export type InfoKind = 'muchol' | 'arsar' | 'togool';
export function GuideView({ language, onOpen }: { language: Language; onOpen: (kind: InfoKind) => void }) {
    const terms: Array<{ kind: InfoKind; label: string; event: 'nooruz' | 'new_moon' | 'togool' }> = [
        { kind: 'muchol', label: language === 'ky' ? 'Мүчөл башы' : 'Начало Года (Мүчөл)', event: 'nooruz' },
        { kind: 'arsar', label: 'Арсар ай', event: 'new_moon' }, { kind: 'togool', label: 'Тогол', event: 'togool' },
    ];
    return <section className={styles.guideScreen} data-screen="guide"><h1 className={styles.pageTitle}>{mobileCopy[language].guide}</h1>
        <div className={styles.guideLayout}>
        <div className={styles.guideTerms}>{terms.map(term => <button key={term.kind} className={styles.eventRow} onClick={() => onOpen(term.kind)} data-info={term.kind}><span className={styles.eventIcon} style={{ color: getEventColorVar(term.event) }}><EventIcon type={term.event} /></span><strong className={styles.eventCopy}>{term.label}</strong><MobileIcon name="chevron" className={styles.chevron} /></button>)}</div>
        <MobileGuideFooter language={language} />
        </div>
    </section>;
}
