import React from 'react';
import { CalendarDialog } from './CalendarDialog';
import type { Language } from '../types/calendar.types';
import styles from './MucholInfoModal.module.css';

interface Props {
    language: Language;
    onClose: () => void;
}

export const MucholInfoModal: React.FC<Props> = ({ language, onClose }) => {
    return (
        <CalendarDialog
            title={language === 'ky' ? '🌸 Мүчөл башы (Жаңы Жыл)' : '🌸 Начало Года (Мүчөл)'}
            language={language}
            onClose={onClose}
            width={460}
            emblemType="nooruz"
            bodyClassName={styles.content}
        >
            <p>
                {language === 'ky' ? (
                    <>
                        <strong className={styles.term}>Мүчөл жылы</strong> - бул Чыгыш календары боюнча эсептелген 12 жылдык цикл. Ар бир жыл белгилүү бир жаныбар менен аталып, ошол жаныбардын “мүнөзү” жылга жана ошол жылы төрөлгөн адамдарга тиешелүү деп эсептелет.
                        <br /><br />
                        Тарыхый жактан көчмөндөр жаңы жылды (Мүчөл башы) Жазгы күн теңелүү менен эмес, Ай календарына байлап келишкен. Астрономиялык жактан ал <strong>Кышкы күн токтогондон кийинки экинчи Жаңы Айга</strong> туура келет.
                        <br /><br />
                        Бул кубулуш ар дайым 21-январдан 20-февралга чейинки аралыкта болот. Календарь так ушул математикалык формуланы колдонуп, Мүчөл жылдын чыныгы астрономиялык башталышын көрсөтөт.
                    </>
                ) : (
                    <>
                        <strong className={styles.term}>Мүчөл жылы</strong> - это начало традиционного 12-летнего животного цикла.
                        <br /><br />
                        Исторически кочевники отсчитывали смену года (Мүчөл башы) по лунному календарю. Астрономически этот день наступает во <strong>второе Новолуние после Зимнего солнцестояния</strong>.
                        <br /><br />
                        Это событие всегда выпадает на период между 21 января и 20 февраля. Данный календарь использует точную математическую формулу для расчета истинного астрономического начала Мүчөл года.
                    </>
                )}
            </p>
        </CalendarDialog>
    );
};
