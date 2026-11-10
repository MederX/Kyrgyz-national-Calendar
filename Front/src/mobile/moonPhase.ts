import { getMoonIllumination } from 'suncalc';

export function getMoonAppearance(now: Date, latitude: number) {
    const { fraction, phase, waxing } = getMoonIllumination(now);
    // Conventional upright phase symbol, mirrored for the southern hemisphere.
    const litSide: 1 | -1 = waxing !== (latitude < 0) ? 1 : -1;
    return { fraction, phase, waxing, litSide };
}

/** Project the illuminated portion of a sphere, rather than overlaying two circles. */
export function getIlluminatedMoonPath(fraction: number, litSide: 1 | -1): string {
    const radius = 21;
    const lit = Math.min(1, Math.max(0, fraction));
    const terminatorRadius = Math.abs(1 - 2 * lit) * radius;
    const outerSweep = litSide === 1 ? 1 : 0;
    const innerSweep = lit < 0.5 ? 1 - outerSweep : outerSweep;
    return `M 24 3 A ${radius} ${radius} 0 0 ${outerSweep} 24 45 A ${terminatorRadius} ${radius} 0 0 ${innerSweep} 24 3 Z`;
}
