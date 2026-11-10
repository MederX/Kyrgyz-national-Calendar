import test from 'node:test';
import assert from 'node:assert/strict';
import { readPreferences, savePreferences } from './preferences.ts';

test('missing, malformed, and blocked storage fall back to usable defaults', () => {
    for (const storage of [{ getItem: () => null }, { getItem: () => '{' }, { getItem() { throw Error('denied'); } }]) {
        const result = readPreferences(storage);
        assert.equal(result.language, 'ky');
        assert.equal(result.theme, 'light');
        assert.equal(result.location.timeZone, 'Asia/Bishkek');
    }
});
test('valid language, theme, location survive saving and reopening', () => {
    const map = new Map();
    const storage = { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) };
    const preferences = { language: 'ru', theme: 'dark', location: { latitude: 40.7128, longitude: -74.006, cityName: 'Нью-Йорк', timeZone: 'America/New_York' } };
    savePreferences(storage, preferences);
    assert.deepEqual(readPreferences(storage), preferences);
});
test('invalid coordinates and unknown timezones cannot break current-day calculation', () => {
    for (const location of [{ latitude: 200, longitude: 0, cityName: 'X', timeZone: 'UTC' }, { latitude: 0, longitude: 0, cityName: 'X', timeZone: 'Invalid/Zone' }]) {
        const result = readPreferences({ getItem: () => JSON.stringify({ language: 'bad', theme: 'bad', location }) });
        assert.equal(result.location.cityName, 'Бишкек');
        assert.equal(result.language, 'ky');
    }
});
test('storage write failures do not prevent preference changes during this session', () => {
    assert.doesNotThrow(() => savePreferences({ setItem() { throw Error('full'); } }, readPreferences({ getItem: () => null })));
});
