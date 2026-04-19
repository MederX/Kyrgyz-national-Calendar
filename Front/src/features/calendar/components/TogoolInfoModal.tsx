import React from 'react';
import type { Language } from '../types/calendar.types';
import styles from './TogoolInfoModal.module.css';

interface Props {
    language: Language;
    onClose: () => void;
}

export const TogoolInfoModal: React.FC<Props> = ({ language, onClose }) => {
    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>{language === 'ky' ? 'Тоогол деген эмне?' : 'Что такое Тоогол?'}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.content}>
                    <div className={styles.illustration}>
                        {/* SVG Illustration of Pleiades */}
                        <svg viewBox="0 0 100 100" className={styles.svg}>
                            <circle cx="50" cy="50" r="48" fill="#0F172A" />
                            <circle cx="45" cy="40" r="2" fill="#F59E0B" />
                            <circle cx="55" cy="35" r="1.5" fill="#F59E0B" />
                            <circle cx="60" cy="45" r="2.5" fill="#F59E0B" />
                            <circle cx="35" cy="55" r="1" fill="#Fcd34d" />
                            <circle cx="40" cy="65" r="1.5" fill="#Fcd34d" />
                            <circle cx="65" cy="60" r="2" fill="#Fcd34d" />
                            <path d="M45 40 L55 35 L60 45 L65 60 L40 65 L35 55 Z" stroke="var(--color-togool)" strokeWidth="0.5" fill="none" opacity="0.5" />
                            <circle cx="75" cy="25" r="8" fill="var(--color-new-moon)" />
                            <path d="M60 45 Q 65 35 75 25" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2 2" fill="none" />
                        </svg>
                    </div>

                    {language === 'ky' ? (
                        <div className={styles.text}>
                            <p>
                                <strong>Тоогол</strong> — Айдын Үркөр (Плеядалар) топ жылдызы менен
                                асман сферасында бир сызыкта кесилишүү (же жакындашуу) учуру.
                            </p>
                            <p>
                                Көчмөн кыргыздар бул астрономиялык кубулушту кылымдар бою аба ырайын,
                                мезгил алмашуусун жана табияттын өзгөрүүсүн алдын ала билүү үчүн колдонуп келишкен.
                            </p>
                            <p>
                                Ай менен Үркөр тогошкон күнү аба ырайы кескин өзгөрүшү мүмкүн —
                                шамал согуп, жаан-чачын күтүлөт. Бул кыргыздардын салттуу жыл сүрүүсүнүн
                                өзгөчө негизи болуп саналат.
                            </p>
                        </div>
                    ) : (
                        <div className={styles.text}>
                            <p>
                                <strong>Тоогол</strong> — это момент схождения (или максимального сближения)
                                Луны со звездным скоплением Плеяды (Үркөр).
                            </p>
                            <p>
                                Кочевые кыргызы веками использовали это астрономическое явление для
                                предсказания погоды, смены сезонов и изменений в природе.
                            </p>
                            <p>
                                Считается, что в день Тоогола может резко измениться погода —
                                ожидается сильный ветер или осадки. Это уникальная основа
                                традиционного кыргызского календаря.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
