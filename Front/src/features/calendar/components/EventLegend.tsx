import React, { useState } from 'react';
import type { Language } from '../types/calendar.types';
import { TogoolInfoModal } from './TogoolInfoModal';
import { MucholInfoModal } from './MucholInfoModal';
import { ArsarInfoModal } from './ArsarInfoModal';
import { EventIcon, getEventColorVar } from './EventIcon';
import type { EventType } from '../types/calendar.types';
import styles from './EventLegend.module.css';

interface Props {
    language: Language;
}

type LegendItemType = EventType | 'ramadan_period' | 'lunar_day_note' | 'arsar_info';

interface LegendItem {
    type: LegendItemType;
    label_ky: string;
    label_ru: string;
    isInteractive?: boolean;
    onClick?: () => void;
}

export const EventLegend: React.FC<Props> = ({ language }) => {
    const [showTogoolInfo, setShowTogoolInfo] = useState(false);
    const [showMucholInfo, setShowMucholInfo] = useState(false);
    const [showArsarInfo, setShowArsarInfo] = useState(false);

    const renderLegendIcon = (type: LegendItemType) => {
        if (type === 'ramadan_period') {
            return <span className={styles.periodSwatch} />;
        }

        if (type === 'lunar_day_note') {
            return <span className={styles.abbrevSlot}>ЛД</span>;
        }

        if (type === 'arsar_info') {
            return <span className={styles.abbrevSlot}>АА</span>;
        }

        return (
            <span
                className={styles.iconSlot}
                style={{ color: getEventColorVar(type) }}
            >
                <EventIcon type={type} className={styles.legendIcon} />
            </span>
        );
    };

    const blocks: Array<{ title: string; items: LegendItem[] }> = [
        {
            title: language === 'ky' ? 'Астрономия' : 'Астрономия',
            items: [
                { type: 'new_moon', label_ky: 'Ай жаңырган күн', label_ru: 'Новолуние' },
                { type: 'full_moon', label_ky: 'Ай толгон күн', label_ru: 'Полнолуние' },
                { type: 'togool', label_ky: 'Тогол', label_ru: 'Тогол', isInteractive: true, onClick: () => setShowTogoolInfo(true) },
                { type: 'arsar_info', label_ky: 'Арсар ай', label_ru: 'Арсар ай', isInteractive: true, onClick: () => setShowArsarInfo(true) },
                ...(language === 'ru'
                    ? [{ type: 'lunar_day_note' as const, label_ky: 'ай күнү', label_ru: 'лунный день' }]
                    : []),
            ]
        },
        {
            title: language === 'ky' ? 'Ислам дини' : 'Религия',
            items: [
                { type: 'ramadan_period', label_ky: 'Рамазан айы', label_ru: 'Месяц Рамазан' },
                { type: 'kadyr_tun', label_ky: 'Кадыр түн', label_ru: 'Ночь Предопределения' },
                { type: 'eid_al_fitr', label_ky: 'Орозо айт', label_ru: 'Орозо айт' },
                { type: 'kurman_ait', label_ky: 'Курман айт', label_ru: 'Курман айт' },
            ]
        },
        {
            title: language === 'ky' ? 'Мамлекет & Салт' : 'Государство и Традиции',
            items: [
                { type: 'nooruz', label_ky: 'Мүчөл башы', label_ru: 'Начало Года (Мүчөл)', isInteractive: true, onClick: () => setShowMucholInfo(true) },
                { type: 'holiday', label_ky: 'Мамлекеттик майрамдар', label_ru: 'Гос. праздники' },
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
                                {renderLegendIcon(item.type)}
                                <span className={styles.label}>{language === 'ky' ? item.label_ky : item.label_ru}</span>
                                {item.isInteractive && (
                                    <span className={styles.infoBadge}>i</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {showTogoolInfo && <TogoolInfoModal language={language} onClose={() => setShowTogoolInfo(false)} />}
            {showMucholInfo && <MucholInfoModal language={language} onClose={() => setShowMucholInfo(false)} />}
            {showArsarInfo && <ArsarInfoModal language={language} onClose={() => setShowArsarInfo(false)} />}
        </div>
    );
};
