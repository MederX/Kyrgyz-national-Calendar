import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

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

test('year dropdown scrolls the selected year into view when opened', () => {
    assert.match(source, /selectedOptionRef/);
    assert.match(source, /scrollIntoView\(\{\s*block:\s*'center'\s*\}\)/);
    assert.match(source, /ref=\{year === value \? selectedOptionRef : undefined\}/);
});

test('year dropdown aligns with the full arrow-to-arrow control width', () => {
    const wrapperRuleBody = getRuleBody('.wrapper');
    const dropdownRuleBody = getRuleBody('.dropdown');

    assert.match(wrapperRuleBody, /width\s*:\s*220px/);
    assert.match(css, /\.yearButton\s*\{[^}]*flex\s*:\s*1\s+1\s+auto/);
    assert.match(dropdownRuleBody, /left\s*:\s*0/);
    assert.match(dropdownRuleBody, /right\s*:\s*0/);
    assert.doesNotMatch(dropdownRuleBody, /width\s*:\s*220px/);
});
