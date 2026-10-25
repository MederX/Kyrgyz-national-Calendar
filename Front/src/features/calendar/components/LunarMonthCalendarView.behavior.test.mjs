import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { centerMenuOption } from '../hooks/useViewportMenu.ts';

const source = readFileSync(new URL('./LunarMonthCalendarView.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('./LunarMonthCalendarView.module.css', import.meta.url), 'utf8');

function getRuleBody(selector) {
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`));
    return match?.[1] ?? '';
}

test('lunar month selector keeps dropdown behavior but uses month step buttons', () => {
    const controlRuleBody = getRuleBody('.monthControl');

    assert.doesNotMatch(source, /<select/);
    assert.match(source, /monthSelectorRef/);
    assert.match(source, /document\.addEventListener\('pointerdown'/);
    assert.match(source, /!monthSelectorRef\.current\.contains\(target\)/);
    assert.match(source, /setSelectedMonthIndex\(selectedIndex - 1\)/);
    assert.match(source, /setSelectedMonthIndex\(selectedIndex \+ 1\)/);
    assert.match(source, /selectedIndex > 0/);
    assert.match(source, /selectedIndex < months\.length - 1/);
    assert.match(source, /styles\.monthStepButton/);
    assert.doesNotMatch(source, /disabled=\{selectedIndex === 0\}/);
    assert.doesNotMatch(source, /disabled=\{selectedIndex === months\.length - 1\}/);
    assert.match(controlRuleBody, /display\s*:\s*flex/);
    assert.doesNotMatch(controlRuleBody, /grid-template-columns/);
    assert.doesNotMatch(source, /monthSelectDates/);
});

test('lunar month dropdown uses the same internal scroll sizing as year dropdown', () => {
    const ruleBody = getRuleBody('.monthDropdown');

    assert.match(ruleBody, /max-height\s*:\s*320px/);
    assert.match(ruleBody, /overflow-y\s*:\s*auto/);
    assert.match(source, /styles\.monthOptionDates/);
});

test('lunar month selection is centered by scrolling only its own list', () => {
    const menu = { clientHeight: 200, scrollTop: 80, getBoundingClientRect: () => ({ top: 100 }) };
    const optionOffset = 240;
    const option = {
        offsetHeight: 44,
        getBoundingClientRect: () => ({ top: 100 + optionOffset - menu.scrollTop }),
        scrollIntoView: () => { throw new Error('Must not scroll the page'); },
    };
    centerMenuOption(option, menu);
    const visibleCenter = option.getBoundingClientRect().top - 100 + option.offsetHeight / 2;
    assert.equal(visibleCenter, menu.clientHeight / 2);
});

test('lunar month dropdown is selectable, opaque, and lays dates to the right', () => {
    const wrapperRuleBody = getRuleBody('.wrapper');
    const headerRuleBody = getRuleBody('.header');
    const dropdownRuleBody = getRuleBody('.monthDropdown');
    const optionRuleBody = getRuleBody('.monthOption');

    assert.match(wrapperRuleBody, /overflow\s*:\s*visible/);
    assert.match(headerRuleBody, /z-index\s*:\s*[2-9]/);
    assert.match(dropdownRuleBody, /background\s*:\s*var\(--bg-surface\)/);
    assert.doesNotMatch(css, /rgba\(255,\s*252,\s*246,\s*0\.96\)/);
    assert.match(optionRuleBody, /grid-template-columns\s*:\s*minmax\(0,\s*1fr\)\s*auto/);
});

test('lunar month dropdown aligns with the full month control width', () => {
    const selectorRuleBody = getRuleBody('.selectorLabel');
    const dropdownRuleBody = getRuleBody('.monthDropdown');

    assert.match(selectorRuleBody, /width\s*:\s*min\(340px,\s*100%\)/);
    assert.match(selectorRuleBody, /min-width\s*:\s*0/);
    assert.match(dropdownRuleBody, /left\s*:\s*0/);
    assert.match(dropdownRuleBody, /right\s*:\s*0/);
    assert.doesNotMatch(dropdownRuleBody, /width\s*:\s*min\(340px,\s*calc\(100vw - 32px\)\)/);
});
