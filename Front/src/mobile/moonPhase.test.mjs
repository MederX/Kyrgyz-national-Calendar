import test from 'node:test';
import assert from 'node:assert/strict';
import { getMoonAppearance } from './moonPhase.ts';

// Independent reference fractions from the project's PyEphem backend (UTC instants).
const references = [
    ['2026-02-17T12:01:00Z', 0.0000659773],
    ['2026-02-24T12:00:00Z', 0.499056740],
    ['2026-03-03T12:00:00Z', 0.999986496],
    ['2026-03-11T12:00:00Z', 0.492055092],
    ['2026-03-19T12:00:00Z', 0.002930919],
    ['2026-11-01T12:00:00Z', 0.541116104],
];

test('illuminated fraction agrees with independent astronomical reference values', () => {
    for (const [date, expected] of references) {
        const actual = getMoonAppearance(new Date(date), 42.87);
        assert.ok(Math.abs(actual.fraction - expected) < 0.001, `${date}: ${actual.fraction} vs ${expected}`);
        assert.ok(actual.phase >= 0 && actual.phase <= 1);
    }
});

test('waxing and waning quarters illuminate opposite sides', () => {
    const waxing = getMoonAppearance(new Date('2026-02-24T12:00:00Z'), 42.87);
    const waning = getMoonAppearance(new Date('2026-03-11T12:00:00Z'), 42.87);
    assert.equal(waxing.waxing, true);
    assert.equal(waxing.litSide, 1);
    assert.equal(waning.waxing, false);
    assert.equal(waning.litSide, -1);
});

test('southern hemisphere mirrors the symbol without changing lunar illumination', () => {
    const date = new Date('2026-02-24T12:00:00Z');
    const north = getMoonAppearance(date, 42.87), south = getMoonAppearance(date, -33.87);
    assert.equal(south.fraction, north.fraction);
    assert.equal(south.litSide, -north.litSide);
});

test('phase uses the current instant rather than a local date or a fixed lunar-day picture', () => {
    assert.deepEqual(getMoonAppearance(new Date('2026-03-11T18:00:00+06:00'), 42.87), getMoonAppearance(new Date('2026-03-11T12:00:00Z'), 42.87));
    assert.notEqual(getMoonAppearance(new Date('2026-03-11T00:00:00Z'), 42.87).fraction, getMoonAppearance(new Date('2026-03-11T23:59:00Z'), 42.87).fraction);
});
