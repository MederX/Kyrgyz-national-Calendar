import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('./LunarMonthCalendarView.module.css', import.meta.url), 'utf8');

function getRuleBody(selector) {
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`));
    return match?.[1] ?? '';
}

test('light theme lunar today cell has a visible standalone highlight', () => {
    const ruleBody = getRuleBody("[data-theme='light'] .today");

    assert.match(ruleBody, /background\s*:/);
    assert.match(ruleBody, /border-color\s*:/);
    assert.match(ruleBody, /box-shadow\s*:/);
});

test('dark theme lunar today cell has the same highlight primitives', () => {
    const todayRuleBody = getRuleBody('.today');
    const dayNumberRuleBody = getRuleBody('.today .gregorianDay');

    assert.match(todayRuleBody, /background\s*:\s*rgba\(214,\s*220,\s*102,\s*0\.13\)/);
    assert.match(todayRuleBody, /border-color\s*:/);
    assert.match(todayRuleBody, /box-shadow\s*:/);
    assert.match(dayNumberRuleBody, /color\s*:/);
});
