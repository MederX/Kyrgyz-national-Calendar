import type { Language } from '../types/calendar.types';
import styles from './SiteFooter.module.css';

type SiteFooterProps = {
    language: Language;
};

const footerCopy = {
    ky: {
        brand: 'Кыргыз улуттук ай күн календары',
        description: 'Кыргыз элинин салттуу жыл санагын, ай фазаларын, тоголду, мүчөлдү жана маанилүү календардык белгилерди бир жылдык көрүнүштө түшүндүргөн веб-календарь.',
        noticeTitle: 'Маанилүү эскертүү',
        noticeText: 'Рамазан жана Айт күндөрү эсептик маалымат катары берилет; расмий даталар жергиликтүү диний органдар тарабынан такталышы мүмкүн.',
        clientTitle: 'Биз жөнүндө',
        clientText: 'ОФ «Айгине» Маданий-изилдөө борбору — 2004-жылы Бишкекте негизделген коммерциялык эмес уюм. Борбор - салттуу билимдер, билим берүү, гуманитардык жана социалдык изилдөөлөргө адистешип, НКО, мамлекеттик мекемелер жана эл аралык уюмдар менен иштешет. Ошондой эле материалдык эмес маданий мурасты сактоо багытында иш алып барат.',
        siteLabel: 'Сайт',
        versionTitle: 'Календардын версиясы',
        versionText: 'Негиз катары Тороң Жумаевдин кыргыз элинин улуттук «Ай-Күн» календарынын версиясы алынган. Ал ай жаңырган күндөрдү, тоголду, Ислам дининдеги маанилүү күндөрдү, мүчөл жыл санагын жана башка кыргыз республикасында белгиленчүү майрам күндөрдү бириктирет. Бул сайтта календарь санариптик форматка ылайыкташтырылып, астрономиялык эсептөөлөр менен толукталды.',
        periodText: 'Колдоого алынган аралык: 1900-жылдан 2050-жылга чейин.',
        calculationsText: 'Эсептөөлөр: Skyfield, Ephem, de421.bsp.',
        authorsTitle: 'Долбоордун авторлору',
        authorsLead: '«Hack the Heritage» хакатонунун жеңүүчүсү болгон «Үркөр» командасы.',
        copyright: '© 2026 Кыргыз улуттук календарь',
        authors: [
            ['Роговцов Артём', 'мобилдик тиркеме бөлүгүн иштеп чыгуучу, 98-лицей.'],
            ['Анжелина Чойбалсанова', 'питчер, «Ала-Тоо» университети.'],
            ['Ыманалиев Медер', 'веб-сайт бөлүгүн иштеп чыгуучу, УЦА.'],
            ['Элчи Келсинбеков', 'веб-сайт бөлүгүн иштеп чыгуучу, УЦА.'],
            ['Алиаскар Жумаев', 'календарь боюнча аналитик-эксперт, тимлид.'],
        ],
    },
    ru: {
        brand: 'Кыргызский национальный календарь',
        description: 'Веб-календарь о традиционном кыргызском счете времени, фазах Луны, тоголе, мучоле и важных календарных отметках в годовом представлении.',
        noticeTitle: 'Важное примечание',
        noticeText: 'Даты Рамазана и Айт приведены как расчетная информация; официальные даты могут уточняться местными религиозными органами.',
        clientTitle: 'О нас',
        clientText: 'ОФ Культурно-исследовательский центр «Айгине» — некоммерческая организация в Бишкеке, основанная в 2004 году. Центр специализируется на традиционных знаниях, образовании, гуманитарных и социальных исследованиях, активно работает с НКО, государственными учреждениями и международными организациями. Также занимается сохранением нематериального культурного наследия.',
        siteLabel: 'Сайт',
        versionTitle: 'Версия календаря',
        versionText: 'За основу взята версия кыргызского национального «Ай-Күн» календаря Тороң Жумаева. Она объединяет дни новолуния, тогол, важные дни в Исламе, летоисчисление "мүчөл" и другие праздничные дни отмечаемые в Кыргызской Республике. В этом сайте календарь адаптирован в цифровой формат и дополнен астрономическими расчетами.',
        periodText: 'Поддерживаемый период: 1900-2050.',
        calculationsText: 'Расчеты: Skyfield, Ephem, de421.bsp.',
        authorsTitle: 'Авторы проекта',
        authorsLead: 'Команда «Үркөр», победитель хакатона «Hack the Heritage».',
        copyright: '© 2026 Кыргызский национальный календарь',
        authors: [
            ['Роговцов Артём', 'разработчик мобильного приложения, Лицей 98.'],
            ['Анжелина Чойбалсанова', 'питчер, университет «Ала-Тоо».'],
            ['Ыманалиев Медер', 'разработчик сайта, УЦА.'],
            ['Элчи Келсинбеков', 'разработчик сайта, УЦА.'],
            ['Алиаскар Жумаев', 'аналитик-эксперт по вопросам календаря, тимлид.'],
        ],
    },
} as const;

export const SiteFooter = ({ language }: SiteFooterProps) => {
    const copy = footerCopy[language];

    return (
        <footer className={styles.siteFooter}>
            <div className={styles.footerInner}>
                <div className={styles.footerLead}>
                    <div>
                        <div className={styles.brandMark}>
                            <span className={styles.markIcon} aria-hidden="true">☾</span>
                            <div className={styles.footerBrand}>{copy.brand}</div>
                        </div>
                        <p className={styles.footerDescription}>{copy.description}</p>
                    </div>
                    <div className={styles.footerNotice}>
                        <span className={styles.noticeTitle}>{copy.noticeTitle}</span>
                        <p className={styles.noticeText}>{copy.noticeText}</p>
                    </div>
                </div>

                <div className={styles.footerColumns}>
                    <section className={styles.footerBlock}>
                        <h3 className={styles.footerColumnTitle}>{copy.clientTitle}</h3>
                        <p className={styles.footerText}>{copy.clientText}</p>
                        <ul className={styles.footerList}>
                            <li className={styles.footerItem}>
                                <strong>Email:</strong>{' '}
                                <a className={styles.footerLink} href="mailto:office.aigine@gmail.com">
                                    office.aigine@gmail.com
                                </a>
                            </li>
                            <li className={styles.footerItem}>
                                <strong>{copy.siteLabel}:</strong>{' '}
                                <a className={styles.footerLink} href="https://aigine.kg/" target="_blank" rel="noreferrer">
                                    aigine.kg
                                </a>
                            </li>
                        </ul>
                    </section>

                    <section className={styles.footerBlock}>
                        <h3 className={styles.footerColumnTitle}>{copy.versionTitle}</h3>
                        <p className={styles.footerText}>{copy.versionText}</p>
                        <ul className={styles.footerList}>
                            <li className={styles.footerItem}>{copy.periodText}</li>
                            <li className={styles.footerItem}>{copy.calculationsText}</li>
                        </ul>
                    </section>

                    <section className={styles.footerBlock}>
                        <h3 className={styles.footerColumnTitle}>{copy.authorsTitle}</h3>
                        <p className={styles.footerText}>{copy.authorsLead}</p>
                        <ul className={styles.footerList}>
                            {copy.authors.map(([name, role]) => (
                                <li className={styles.footerItem} key={name}>
                                    <strong>{name}</strong> — {role}
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                <div className={styles.footerBottom}>
                    <span>{copy.copyright}</span>
                    <span>Команда «Үркөр» · Hack the Heritage</span>
                </div>
            </div>
        </footer>
    );
};
