import { useState, type ReactNode } from 'react';
import type { Language } from '../features/calendar/types/calendar.types';
import { mobileGuideFooterCopy } from './MobileGuideFooter.copy';
import { MobileIcon } from './MobileIcon';
import { CalendarLogo } from './CalendarLogo';
import styles from './MobileGuideFooter.module.css';

type GuideSection = 'client' | 'version' | 'authors';

function InlineSection({
    id,
    title,
    preview,
    expanded,
    onToggle,
    children,
}: {
    id: string;
    title: string;
    preview: ReactNode;
    expanded: boolean;
    onToggle: () => void;
    children: ReactNode;
}) {
    return (
        <section className={styles.section}>
            <button
                className={styles.sectionButton}
                type="button"
                aria-expanded={expanded}
                aria-controls={id}
                onClick={onToggle}
            >
                <span className={styles.sectionCopy}>
                    <strong className={styles.sectionTitle}>{title}</strong>
                    {!expanded && <span className={styles.preview}>{preview}</span>}
                </span>
                <MobileIcon
                    name="chevron"
                    className={`${styles.chevron} ${expanded ? styles.chevronExpanded : ''}`}
                />
            </button>
            <div id={id} className={styles.details} hidden={!expanded}>
                {children}
            </div>
        </section>
    );
}

export function MobileGuideFooter({ language }: { language: Language }) {
    const copy = mobileGuideFooterCopy[language];
    const [expandedSection, setExpandedSection] = useState<GuideSection | null>(null);

    const toggleSection = (section: GuideSection) => {
        setExpandedSection(current => current === section ? null : section);
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.identity}>
                <div className={styles.brandRow}>
                    <span className={styles.brandMark} aria-hidden="true"><CalendarLogo /></span>
                    <strong className={styles.brand}>{copy.brand}</strong>
                </div>
                <p className={styles.description}>{copy.description}</p>
            </div>

            <aside className={styles.notice}>
                <strong className={styles.noticeTitle}>{copy.noticeTitle}</strong>
                <p className={styles.noticeText}>{copy.noticeText}</p>
            </aside>

            <div className={styles.sections}>
                <InlineSection
                    id="mobile-guide-client"
                    title={copy.clientTitle}
                    preview={copy.clientText}
                    expanded={expandedSection === 'client'}
                    onToggle={() => toggleSection('client')}
                >
                    <p>{copy.clientText}</p>
                    <ul className={styles.contactList}>
                        <li><strong>Email:</strong>{' '}<a href="mailto:office.aigine@gmail.com">office.aigine@gmail.com</a></li>
                        <li><strong>{copy.siteLabel}:</strong>{' '}<a href="https://aigine.kg/" target="_blank" rel="noreferrer">aigine.kg</a></li>
                    </ul>
                </InlineSection>

                <InlineSection
                    id="mobile-guide-version"
                    title={copy.versionTitle}
                    preview={<span className={styles.previewMeta}>{copy.periodText} {copy.calculationsText}</span>}
                    expanded={expandedSection === 'version'}
                    onToggle={() => toggleSection('version')}
                >
                    <p>{copy.versionText}</p>
                    <ul className={styles.metaList}>
                        <li>{copy.periodText}</li>
                        <li>{copy.calculationsText}</li>
                    </ul>
                </InlineSection>

                <InlineSection
                    id="mobile-guide-authors"
                    title={copy.authorsTitle}
                    preview={copy.authorsLead}
                    expanded={expandedSection === 'authors'}
                    onToggle={() => toggleSection('authors')}
                >
                    <p>{copy.authorsLead}</p>
                    <ul className={styles.authorList}>
                        {copy.authors.map(([name, role]) => (
                            <li key={name}><strong>{name}</strong> — {role}</li>
                        ))}
                    </ul>
                </InlineSection>
            </div>

            <div className={styles.footerBottom}>
                <span>{copy.copyright}</span>
                <span>Команда «Үркөр» · Hack the Heritage</span>
            </div>
        </footer>
    );
}
