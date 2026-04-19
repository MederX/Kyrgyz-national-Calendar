import React from 'react';
import type { Language } from '../types/calendar.types';
import styles from './MucholInfoModal.module.css';

interface Props {
    language: Language;
    onClose: () => void;
}

export const MucholInfoModal: React.FC<Props> = ({ language, onClose }) => {
    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <header className={styles.header}>
                    <h3 className={styles.title}>
                        🌸 {language === 'ky' ? 'Мүчөл башы (Жаңы Жыл)' : 'Начало Года (Мүчөл)'}
                    </h3>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </header>

                <div className={styles.content}>
                    <p>
                        {language === 'ky' ? (
                            <>
                                <strong>Мүчөл жылы</strong> — бул 12 жылдык животноводдук циклдин башталышы.
                                <br /><br />
                                Тарыхый жактан көчмөндөр жаңы жылды (Мүчөл башы) Жазгы күн теңелүү менен эмес, Ай календарына байлап келишкен. Астрономиялык жактан ал <strong>Кышкы күн токтогондон кийинки экинчи Жаңы Айга</strong> туура келет.
                                <br /><br />
                                Бул кубулуш ар дайым 21-январдан 20-февралга чейинки аралыкта болот. Календарь так ушул математикалык формуланы колдонуп, Мүчөл жылдын чыныгы астрономиялык башталышын көрсөтөт.
                            </>
                        ) : (
                            <>
                                <strong>Мүчөл жылы</strong> — это начало традиционного 12-летнего животного цикла.
                                <br /><br />
                                Исторически кочевники отсчитывали смену года (Мүчөл башы) по лунному календарю. Астрономически этот день наступает во <strong>второе Новолуние после Зимнего солнцестояния</strong>.
                                <br /><br />
                                Это событие всегда выпадает на период между 21 января и 20 февраля. Данный календарь использует точную математическую формулу для расчета истинного астрономического начала Мүчөл года.
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};
