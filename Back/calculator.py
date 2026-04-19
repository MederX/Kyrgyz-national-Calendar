"""
Astronomical calculations for the Kyrgyz Root Calendar.

- Togoshuu (Pleiades / Moon conjunction) via ecliptic longitude comparison
- Moon phases (new moon, full moon) via skyfield.almanac
- Ramadan periods via tabular Islamic calendar conversion
"""

import math
import numpy as np
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo
from skyfield.api import load, wgs84, Star
from skyfield.almanac import find_discrete
from skyfield import almanac

# ── Load ephemeris and timescale once at module level ──────────────────────
eph = load('de421.bsp')
earth = eph['earth']
moon = eph['moon']
ts = load.timescale()

# Alcyone — brightest star in the Pleiades (η Tauri)
alcyone = Star(ra_hours=(3, 47, 29.0), dec_degrees=(24, 6, 18.0))

# Tabular Islamic calendar epoch used for Gregorian conversion.
ISLAMIC_EPOCH = 1948439.5


def _get_timezone(tz_name: str) -> ZoneInfo:
    return ZoneInfo(tz_name)


def _to_local_datetime(time_value, tz_name: str) -> datetime:
    return time_value.utc_datetime().astimezone(_get_timezone(tz_name))


# ── Togoshuu / Togool ─────────────────────────────────────────────────────

def calculate_togoshuu(
    year: int,
    lat: float,
    lon: float,
    elevation_m: float = 800,
    tz_name: str = "Asia/Bishkek",
) -> list[datetime]:
    """
    Calculate dates when the Moon's ecliptic longitude crosses that of the
    Pleiades (Alcyone) from below — the traditional Kyrgyz 'Togool' event.

    Returns a list of timezone-aware datetimes in local time.
    """
    observer_location = earth + wgs84.latlon(lat, lon, elevation_m=elevation_m)

    def moon_pleiades_conjunction(t):
        observer = observer_location.at(t)
        _, lon_moon, _ = observer.observe(moon).apparent().ecliptic_latlon()
        _, lon_star, _ = observer.observe(alcyone).apparent().ecliptic_latlon()
        return np.sin(lon_moon.radians - lon_star.radians) > 0

    moon_pleiades_conjunction.step_days = 1.0

    t0 = ts.utc(year, 1, 1)
    t1 = ts.utc(year, 12, 31)
    times, events = find_discrete(t0, t1, moon_pleiades_conjunction)

    conjunction_dates: list[datetime] = []

    for t, event in zip(times, events):
        if event == 1:
            conjunction_dates.append(_to_local_datetime(t, tz_name))

    return conjunction_dates


# ── Moon phases ────────────────────────────────────────────────────────────

def calculate_moon_phases(
    year: int,
    month: int | None = None,
    tz_name: str = "Asia/Bishkek",
) -> list[dict]:
    """
    Calculate new-moon and full-moon events for a given year/month.
    If month is None, calculate for the full year.
    """
    if month is None:
        t0 = ts.utc(year, 1, 1)
        t1 = ts.utc(year + 1, 1, 1)
    else:
        if month == 12:
            t0 = ts.utc(year, month, 1)
            t1 = ts.utc(year + 1, 1, 1)
        else:
            t0 = ts.utc(year, month, 1)
            t1 = ts.utc(year, month + 1, 1)

    f = almanac.moon_phases(eph)
    times, phases = find_discrete(t0, t1, f)

    PHASE_MAP = {
        0: "new_moon",
        2: "full_moon",
    }

    results: list[dict] = []
    for t, phase in zip(times, phases):
        phase_name = PHASE_MAP.get(int(phase))
        if phase_name is not None:
            results.append({
                "datetime": _to_local_datetime(t, tz_name),
                "phase": phase_name,
            })

    return results


def calculate_nooruz(year: int, tz_name: str = "Asia/Bishkek") -> datetime:
    """
    Calculate the Lunar New Year (Мүчөл жылы башталышы).
    Astronomically, it is the second New Moon after the Winter Solstice.
    """
    t0 = ts.utc(year - 1, 12, 1)
    t1 = ts.utc(year - 1, 12, 31)
    times_s, _ = almanac.find_discrete(t0, t1, almanac.seasons(eph))

    winter_solstice_time = times_s[0] if len(times_s) > 0 else ts.utc(year - 1, 12, 21)

    t2 = ts.utc(year, 3, 1)
    times_m, phases = almanac.find_discrete(winter_solstice_time, t2, almanac.moon_phases(eph))

    new_moons = []
    for tm, phase in zip(times_m, phases):
        if phase == 0:
            new_moons.append(tm)

    lny_time = new_moons[1] if len(new_moons) >= 2 else new_moons[0]
    return _to_local_datetime(lny_time, tz_name)


# ── Islamic calendar helpers ──────────────────────────────────────────────

def _julian_day_to_gregorian(julian_day: float) -> date:
    jd = int(math.floor(julian_day + 0.5))
    a = jd + 32044
    b = (4 * a + 3) // 146097
    c = a - (146097 * b) // 4
    d = (4 * c + 3) // 1461
    e = c - (1461 * d) // 4
    m = (5 * e + 2) // 153
    day = e - (153 * m + 2) // 5 + 1
    month = m + 3 - 12 * (m // 10)
    year = 100 * b + d - 4800 + (m // 10)
    return date(year, month, day)


def _islamic_to_julian_day(year: int, month: int, day: int) -> float:
    return (
        day
        + math.ceil(29.5 * (month - 1))
        + (year - 1) * 354
        + math.floor((3 + 11 * year) / 30)
        + ISLAMIC_EPOCH
        - 1
    )


def islamic_to_gregorian(year: int, month: int, day: int) -> date:
    return _julian_day_to_gregorian(_islamic_to_julian_day(year, month, day))


def calculate_ramadan_periods(year: int) -> list[dict]:
    """
    Approximate Ramadan using the tabular Islamic calendar and return all
    periods overlapping the Gregorian year.
    """
    approx_islamic_year = ((year - 622) * 33) // 32
    year_start = date(year, 1, 1)
    year_end = date(year, 12, 31)
    periods: list[dict] = []

    for islamic_year in range(approx_islamic_year - 2, approx_islamic_year + 3):
        ramadan_start = islamic_to_gregorian(islamic_year, 9, 1)
        eid_al_fitr = islamic_to_gregorian(islamic_year, 10, 1)
        ramadan_end = eid_al_fitr - timedelta(days=1)

        if ramadan_end < year_start or ramadan_start > year_end:
            continue

        periods.append({
            "islamic_year": islamic_year,
            "start_date": max(ramadan_start, year_start),
            "end_date": min(ramadan_end, year_end),
            "eid_al_fitr": eid_al_fitr,
            "kadyr_tun": ramadan_start + timedelta(days=26),
            "ai_bashi": ramadan_start - timedelta(days=1),
            "kurman_ait": islamic_to_gregorian(islamic_year, 12, 10),
        })

    periods.sort(key=lambda item: item["start_date"])

    deduped: list[dict] = []
    seen: set[tuple[date, date]] = set()
    for period in periods:
        key = (period["start_date"], period["end_date"])
        if key not in seen:
            seen.add(key)
            deduped.append(period)

    return deduped
