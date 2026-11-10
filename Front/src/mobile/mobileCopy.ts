// These labels belong only to the new mobile navigation and its UI states.
// Product names, calendar terminology, and explanatory prose come from the website.
export const mobileCopy = {
    ky: {
        today: 'Бүгүн', todayTitle: 'Бүгүнкү күн', calendar: 'Календарь', guide: 'Календарь жөнүндө',
        events: 'Күндүн окуялары', upcoming: 'Алдыдагы окуя', empty: 'Бул күнгө белгиленген окуялар жок.',
        loading: 'Маалымат жүктөлүүдө...', error: '⚠️ Маалымат жүктөөдө ката кетти', retry: 'Кайра аракет кылуу', offline: 'Офлайн режим',
        year: 'Жылдык көрүнүш', month: 'Айлык көрүнүш', selectDate: 'Күндү тандоо',
        solar: 'Күн календары', lunar: 'Ай календары', noLunar: 'Бул күнгө ай календарынын маалыматы жок.',
        switchTheme: 'Теманы алмаштыруу', switchLanguage: 'Орус тилине которуу',
        previous: 'Мурунку ай', next: 'Кийинки ай', eventsCount: (count: number) => `${count} окуя`,
    },
    ru: {
        today: 'Сегодня', todayTitle: 'Сегодняшняя дата', calendar: 'Календарь', guide: 'О календаре',
        events: 'События дня', upcoming: 'Ближайшее событие', empty: 'На эту дату нет отмеченных событий.',
        loading: 'Загрузка данных...', error: '⚠️ Ошибка загрузки данных', retry: 'Повторить', offline: 'Офлайн режим',
        year: 'Годовой обзор', month: 'Просмотр месяца', selectDate: 'Выбрать дату',
        solar: 'Солнечный календарь', lunar: 'Лунный календарь', noLunar: 'Нет данных лунного календаря для этой даты.',
        switchTheme: 'Сменить тему', switchLanguage: 'Переключить на кыргызский',
        previous: 'Предыдущий месяц', next: 'Следующий месяц', eventsCount: (count: number) => {
            const plural = new Intl.PluralRules('ru').select(count);
            return `${count} ${plural === 'one' ? 'событие' : plural === 'few' ? 'события' : 'событий'}`;
        },
    },
};
