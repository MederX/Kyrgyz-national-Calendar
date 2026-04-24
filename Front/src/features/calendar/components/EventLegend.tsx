import React, { useState } from 'react';
import type { Language } from '../types/calendar.types';
import { TogoolInfoModal } from './TogoolInfoModal';
import { MucholInfoModal } from './MucholInfoModal';
import styles from './EventLegend.module.css';

interface Props {
    language: Language;
}

const TundukIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '13px', height: '13px', marginRight: '6px', color: 'var(--color-new-moon)' }}>
        <circle cx="12" cy="12" r="9" />
        <path d="M 8 4 Q 12 11 16 4 M 6 6 Q 12 13 18 6 M 8 20 Q 12 13 16 20 M 6 18 Q 12 11 18 18" />
        <path d="M 4 8 Q 11 12 4 16 M 6 6 Q 13 12 6 18 M 20 8 Q 13 12 20 16 M 18 6 Q 11 12 18 18" />
    </svg>
);

const TogoolIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', color: 'var(--color-togool)', marginRight: '6px' }}>
        <path d="M12 2L15 10L23 12L15 14L12 22L9 14L1 12L9 10Z" fill="currentColor" stroke="none" />
        <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="6" cy="6" r="1.5" fill="currentColor" stroke="none" />
    </svg>
);

export const EventLegend: React.FC<Props> = ({ language }) => {
    const [showTogoolInfo, setShowTogoolInfo] = useState(false);
    const [showMucholInfo, setShowMucholInfo] = useState(false);

    const blocks = [
        {
            title: language === 'ky' ? 'Астрономия' : 'Астрономия',
            items: [
                { type: 'new_moon', label_ky: 'Ай жаңырган күн', label_ru: 'Новолуние', renderIcon: () => <TundukIcon /> },
                { type: 'full_moon', label_ky: 'Ай толгон күн', label_ru: 'Полнолуние', renderIcon: () => <span style={{ fontSize: '11px', marginRight: '6px' }}>🌕</span> },
                { type: 'togool', label_ky: 'Тогол ⓘ', label_ru: 'Тогол ⓘ', isInteractive: true, onClick: () => setShowTogoolInfo(true), renderIcon: () => <TogoolIcon /> },
            ]
        },
        {
            title: language === 'ky' ? 'Ислам дини' : 'Религия',
            items: [
                { type: 'ai_bashi', label_ky: 'Ай башы (четтик)', label_ru: 'Начало рамадана (Ай башы)', renderIcon: () => <span style={{ fontSize: '13px', paddingRight: '6px' }}>🌙</span> },
                { type: 'ramadan', label_ky: 'Рамазан', label_ru: 'Месяц Рамадан', renderIcon: () => <span style={{ fontSize: '13px', paddingRight: '6px' }}>☾</span> },
                { type: 'kadyr_tun', label_ky: 'Кадыр түн', label_ru: 'Ночь Предопределения', renderIcon: () => <span style={{ fontSize: '13px', paddingRight: '6px' }}>✨</span> },
                { type: 'eid_al_fitr', label_ky: 'Орозо айт', label_ru: 'Орозо айт (Ид аль-Фитр)', renderIcon: () => <span style={{ fontSize: '13px', paddingRight: '6px' }}>☪</span> },
                { type: 'kurman_ait', label_ky: 'Курман айт', label_ru: 'Курман айт (Ид аль-Адха)', renderIcon: () => <span style={{ fontSize: '13px', paddingRight: '6px' }}>🐑</span> },
            ]
        },
        {
            title: language === 'ky' ? 'Мамлекет & Салт' : 'Государство и Традиции',
            items: [
                { type: 'nooruz', label_ky: 'Мүчөл башы ⓘ', label_ru: 'Начало Года (Мүчөл) ⓘ', isInteractive: true, onClick: () => setShowMucholInfo(true), renderIcon: () => <span style={{ fontSize: '13px', paddingRight: '6px' }}>🌸</span> },
                { type: 'holiday', label_ky: 'Мамлекеттик майрамдар', label_ru: 'Гос. праздники', color: '#ef4444' },
            ]
        }
    ];

    return (
        <div className={styles.legendContainer}>
            {blocks.map(block => (
                <div key={block.title} className={styles.legendBlock}>
                    <h4 className={styles.blockTitle}>{block.title}</h4>
                    <div className={styles.itemGroup}>
                        {block.items.map(item => (
                            <div
                                key={item.type}
                                className={`${styles.item} ${item.isInteractive ? styles.clickable : ''}`}
                                onClick={item.onClick}
                            >
                                {item.renderIcon ? item.renderIcon() : (
                                    <span className={styles.dot} style={{ backgroundColor: item.color }} />
                                )}
                                <span className={styles.label}>{language === 'ky' ? item.label_ky : item.label_ru}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {showTogoolInfo && <TogoolInfoModal language={language} onClose={() => setShowTogoolInfo(false)} />}
            {showMucholInfo && <MucholInfoModal language={language} onClose={() => setShowMucholInfo(false)} />}
        </div>
    );
};
