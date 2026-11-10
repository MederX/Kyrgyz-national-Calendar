import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { centerMenuOption } from '../hooks/useViewportMenu.ts';

const source = readFileSync(new URL('./YearControl.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('./YearControl.module.css', import.meta.url), 'utf8');

function getRuleBody(selector) {
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`));
    return match?.[1] ?? '';
}

test('year dropdown closes when pointer interaction happens outside the control', () => {
    assert.match(source, /wrapperRef/);
    assert.match(source, /document\.addEventListener\('pointerdown'/);
    assert.match(source, /!wrapperRef\.current\.contains\(target\)/);
    assert.match(source, /setOpen\(false\)/);
});

test('year selection is centered by scrolling only its own list', () => {
    const menu = { clientHeight: 160, scrollTop: 0, getBoundingClientRect: () => ({ top: 100 }) };
    const optionOffset = 600;
    const option = {
        offsetHeight: 44,
        getBoundingClientRect: () => ({ top: 100 + optionOffset - menu.scrollTop }),
        scrollIntoView: () => { throw new Error('Must not scroll the page'); },
    };
    centerMenuOption(option, menu);
    const visibleCenter = option.getBoundingClientRect().top - 100 + option.offsetHeight / 2;
    assert.equal(visibleCenter, menu.clientHeight / 2);
});

test('year dropdown aligns with the full arrow-to-arrow control width', () => {
    const wrapperRuleBody = getRuleBody('.wrapper');
    const dropdownRuleBody = getRuleBody('.dropdown');

    assert.match(wrapperRuleBody, /width\s*:\s*var\(--year-control-width,\s*220px\)/);
    assert.match(css, /\.yearButton\s*\{[^}]*flex\s*:\s*1\s+1\s+auto/);
    assert.match(dropdownRuleBody, /left\s*:\s*0/);
    assert.match(dropdownRuleBody, /right\s*:\s*0/);
    assert.doesNotMatch(dropdownRuleBody, /width\s*:\s*220px/);
});
