import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const componentUrl = new URL('./SiteFooter.tsx', import.meta.url);
const cssUrl = new URL('./SiteFooter.module.css', import.meta.url);
const screenSource = readFileSync(new URL('./CalendarScreen.tsx', import.meta.url), 'utf8');

test('calendar screen renders the production site footer', () => {
    assert.equal(existsSync(componentUrl), true, 'SiteFooter.tsx should exist');
    assert.match(screenSource, /import\s+\{\s*SiteFooter\s*\}\s+from\s+'\.\/SiteFooter'/);
    assert.match(screenSource, /<SiteFooter\s+language=\{language\}\s*\/>/);
});

test('site footer contains Kyrgyz and Russian content for client, calendar version, and authors', () => {
    assert.equal(existsSync(componentUrl), true, 'SiteFooter.tsx should exist');
    const source = readFileSync(componentUrl, 'utf8');

    assert.match(source, /Биз жөнүндө/);
    assert.match(source, /О нас/);
    assert.match(source, /Календардын версиясы/);
    assert.match(source, /Версия календаря/);
    assert.match(source, /Долбоордун авторлору/);
    assert.match(source, /Авторы проекта/);
    assert.match(source, /office\.aigine@gmail\.com/);
    assert.match(source, /aigine\.kg/);
    assert.match(source, /Төрөн Жумаев/);
    assert.match(source, /Торона Жумаева/);
    assert.match(source, /Үркөр/);
    assert.match(source, /Hack the Heritage/);
});

test('about us text describes Aigine within the footer length limit', () => {
    assert.equal(existsSync(componentUrl), true, 'SiteFooter.tsx should exist');
    const source = readFileSync(componentUrl, 'utf8');
    const aboutTextMatch = source.match(/clientText:\s*'([^']+)'/g);

    assert.equal(aboutTextMatch?.length, 2);
    assert.match(source, /Культурно-исследовательский центр «Айгине»/);
    assert.match(source, /некоммерческая организация в Бишкеке, основанная в 2004 году/);
    assert.match(source, /традиционных знаниях, образовании, гуманитарных и социальных исследованиях/);
    assert.match(source, /НКО, государственными учреждениями и международными организациями/);

    const ruAboutText = aboutTextMatch?.find((entry) => entry.includes('Культурно-исследовательский центр «Айгине»')) ?? '';
    assert.ok(ruAboutText.length <= 600, `Russian about text should fit 600 chars, got ${ruAboutText.length}`);
});

test('site footer uses approved Kyrgyz wording revisions', () => {
    assert.equal(existsSync(componentUrl), true, 'SiteFooter.tsx should exist');
    const source = readFileSync(componentUrl, 'utf8');

    assert.match(source, /Кыргыз элинин салттуу жыл санагын/);
    assert.match(source, /ОФ «Айгине» Маданий-изилдөө борбору/);
    assert.match(source, /Борбор - салттуу билимдер/);
    assert.match(source, /Ислам дининдеги маанилүү күндөрдү/);
    assert.match(source, /кыргыз республикасында белгиленчүү майрам күндөрдү/);
    assert.match(source, /Колдоого алынган аралык: 1900-жылдан 2050-жылга чейин\./);
    assert.match(source, /Рамазан жана Айт/);
    assert.doesNotMatch(source, /Кыргыз элинин салттуу убакыт санагын/);
    assert.doesNotMatch(source, /ОФ Культурно-изилдөө борбору/);
    assert.doesNotMatch(source, /Рамазан жана айт/);
});

test('Russian calendar version mirrors the approved Kyrgyz version scope', () => {
    assert.equal(existsSync(componentUrl), true, 'SiteFooter.tsx should exist');
    const source = readFileSync(componentUrl, 'utf8');

    assert.match(source, /Она объединяет дни новолуния, тогол, важные дни в Исламе, летоисчисление "мүчөл" и другие праздничные дни отмечаемые в Кыргызской Республике\./);
    assert.doesNotMatch(source, /Она связывает новолуния, Үркөр, тогол и мүчөл/);
});

test('site footer uses approved Kyrgyz author role wording', () => {
    assert.equal(existsSync(componentUrl), true, 'SiteFooter.tsx should exist');
    const source = readFileSync(componentUrl, 'utf8');

    assert.match(source, /мобилдик тиркеме бөлүгүн иштеп чыгуучу/);
    assert.match(source, /веб-сайт бөлүгүн иштеп чыгуучу, УЦА\./);
    assert.doesNotMatch(source, /мобилдик колдонмо иштеп чыгуучу\./);
    assert.doesNotMatch(source, /'сайт иштеп чыгуучу, УЦА\.'/);
});

test('site footer uses approved full author names', () => {
    assert.equal(existsSync(componentUrl), true, 'SiteFooter.tsx should exist');
    const source = readFileSync(componentUrl, 'utf8');

    assert.match(source, /Роговцов Артём/);
    assert.match(source, /Анжелина Чойбалсанова/);
    assert.match(source, /Ыманалиев Медер/);
    assert.match(source, /Элчи Келсинбеков/);
    assert.doesNotMatch(source, /\['Артем',/);
    assert.doesNotMatch(source, /\['Ангелина',/);
    assert.doesNotMatch(source, /\['Медер',/);
    assert.doesNotMatch(source, /\['Элчи',/);
});

test('site footer includes Artem school in both language roles', () => {
    assert.equal(existsSync(componentUrl), true, 'SiteFooter.tsx should exist');
    const source = readFileSync(componentUrl, 'utf8');

    assert.match(source, /\['Роговцов Артём', 'мобилдик тиркеме бөлүгүн иштеп чыгуучу, 98-лицей\.'\]/);
    assert.match(source, /\['Роговцов Артём', 'разработчик мобильного приложения, Лицей 98\.'\]/);
});

test('site footer has a distinct readable blue night background', () => {
    assert.equal(existsSync(cssUrl), true, 'SiteFooter.module.css should exist');
    const css = readFileSync(cssUrl, 'utf8');

    assert.match(css, /--footer-bg\s*:\s*#0b2f4a/);
    assert.match(css, /--footer-text\s*:\s*#eef8f5/);
    assert.match(css, /--footer-muted\s*:\s*#a9bdc9/);
    assert.match(css, /\[data-theme='light'\]\s+\.siteFooter/);
});
