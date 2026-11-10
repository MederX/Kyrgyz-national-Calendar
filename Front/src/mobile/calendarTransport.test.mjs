import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLocalCalendar } from './calendarTransport.ts';

const request = { year: 2026, latitude: 42.8746, longitude: 74.5698, tz_name: 'Asia/Bishkek' };
const response = { year: 2026, events: [], periods: [], lunar_months: [] };

test('cold calculation calls the local engine without a prior cached response', async () => {
    let received;
    const engine = { calculate: async value => { received = value; return { json: JSON.stringify(response) }; } };
    assert.deepEqual(await calculateLocalCalendar(engine, request), response);
    assert.equal(received, request);
});
test('cancelled and malformed calculations cannot populate the mobile cache', async () => {
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(calculateLocalCalendar({ calculate: () => assert.fail('Must not run') }, request, controller.signal), { name: 'AbortError' });
    await assert.rejects(calculateLocalCalendar({ calculate: async () => ({ json: '{}' }) }, request), /Invalid calendar/);
    await assert.rejects(calculateLocalCalendar({ calculate: async () => { throw Error('Bundled data missing'); } }, request), /Bundled data missing/);
});
test('a result arriving after cancellation is discarded', async () => {
    const controller = new AbortController();
    const engine = { calculate: async () => { controller.abort(); return { json: JSON.stringify(response) }; } };
    await assert.rejects(calculateLocalCalendar(engine, request, controller.signal), { name: 'AbortError' });
});
