"""
Astronomical calculations for the Kyrgyz Root Calendar.

- Togoshuu (Pleiades / Moon conjunction) via ecliptic longitude comparison
- Moon phases (new moon, full moon) via skyfield.almanac
- Ramadan periods via tabular Islamic calendar conversion aligned to local new moon
"""

import math
import numpy as np
from datetime import date, datetime, timedelta, timezone
from functools import lru_cache
from zoneinfo import ZoneInfo
import ephem
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

KYRGYZ_LUNAR_MONTH_NAMES = [
    "Бирдин айы",
    "Жалган куран",
    "Чын куран",
    "Бугу",
    "Кулжа",
    "Теке",
    "Баш оона",
    "Аяк оона",
    "Тогуздун айы",
    "Жетинин айы",
    "Бештин айы",
    "Үчтүн айы",
]

LUNAR_TIMELINE_START_YEAR = 1900
LUNAR_TIMELINE_END_YEAR = 2050
ARSAR_OVERLAP_THRESHOLD_DAYS = 10
ARSAR_COOLDOWN_DAYS = 300


def _get_timezone(tz_name: str) -> ZoneInfo:
    return ZoneInfo(tz_name)


def _to_local_datetime(time_value, tz_name: str) -> datetime:
    return time_value.utc_datetime().astimezone(_get_timezone(tz_name))


# ── Traditional Kyrgyz lunar months ───────────────────────────────────────

def _iter_local_new_moons_ephem(tz_name: str) -> list[datetime]:
    tz = _get_timezone(tz_name)
    start_search = ephem.Date(datetime(1899, 11, 1))
    end_search = ephem.Date(datetime(2052, 3, 1))
    current = start_search
    new_moons: list[datetime] = []

    while current < end_search:
        next_new_moon = ephem.next_new_moon(current)
        new_moon_utc = next_new_moon.datetime().replace(tzinfo=timezone.utc)
        new_moons.append(new_moon_utc.astimezone(tz))
        current = next_new_moon + ephem.second

    return new_moons


def _month_display_end_date(next_month_start: datetime) -> date:
    return next_month_start.date() - timedelta(days=1)


def _count_days_in_month(start_day: date, end_day: date, expected_month: int, year: int | None = None) -> int:
    if end_day < start_day:
        return 0

    current_day = start_day
    overlap_days = 0

    while current_day <= end_day:
        if current_day.month == expected_month and (year is None or current_day.year == year):
            overlap_days += 1
        current_day += timedelta(days=1)

    return overlap_days


def _find_initial_birdin_index(new_moons: list[datetime], anchor_year: int) -> int:
    best_index: int | None = None
    best_overlap_days = 0

    for index in range(len(new_moons) - 1):
        start_day = new_moons[index].date()
        end_day = _month_display_end_date(new_moons[index + 1])
        overlap_days = _count_days_in_month(
            start_day,
            end_day,
            expected_month=1,
            year=anchor_year,
        )

        if overlap_days > best_overlap_days:
            best_overlap_days = overlap_days
            best_index = index

    if best_index is None:
        raise ValueError(f"could not find Бирдин айы anchor for {anchor_year}")

    return best_index


@lru_cache(maxsize=16)
def calculate_lunar_month_timeline(tz_name: str = "Asia/Bishkek") -> tuple[dict, ...]:
    """
    Build a continuous traditional Kyrgyz lunar-month timeline.

    The timeline is named globally rather than sliced by Gregorian years. Arsar
    months pause the regular name increment and are rate-limited by a 300-day
    cooldown to avoid repeated triggers caused by the same seasonal drift.
    """
    new_moons = _iter_local_new_moons_ephem(tz_name)
    initial_birdin_index = _find_initial_birdin_index(new_moons, LUNAR_TIMELINE_START_YEAR)
    cooldown_until = new_moons[initial_birdin_index] - timedelta(seconds=1)
    name_index = 0
    timeline: list[dict] = []

    for index in range(initial_birdin_index, len(new_moons) - 1):
        start = new_moons[index]
        next_start = new_moons[index + 1]

        end = next_start - timedelta(seconds=1)
        start_day = start.date()
        end_day = _month_display_end_date(next_start)
        current_name = KYRGYZ_LUNAR_MONTH_NAMES[name_index % len(KYRGYZ_LUNAR_MONTH_NAMES)]
        expected_month = (name_index % len(KYRGYZ_LUNAR_MONTH_NAMES)) + 1
        overlap_days = _count_days_in_month(start_day, end_day, expected_month)

        if overlap_days < ARSAR_OVERLAP_THRESHOLD_DAYS and start > cooldown_until:
            arsar_of = KYRGYZ_LUNAR_MONTH_NAMES[(name_index - 1) % len(KYRGYZ_LUNAR_MONTH_NAMES)]
            timeline.append({
                "name": "АРСАР АЙ",
                "base_name": None,
                "start": start,
                "end": end,
                "start_date_obj": start_day,
                "end_date_obj": end_day,
                "next_new_moon": next_start,
                "days": (end_day - start_day).days + 1,
                "is_arsar": True,
                "arsar_of": arsar_of,
                "status": "КРИТИЧЕСКИЙ БУФЕР",
                "season_month": None,
                "overlap_days": overlap_days,
            })
            cooldown_until = end + timedelta(days=ARSAR_COOLDOWN_DAYS)
            continue

        timeline.append({
            "name": current_name,
            "base_name": current_name,
            "start": start,
            "end": end,
            "start_date_obj": start_day,
            "end_date_obj": end_day,
            "next_new_moon": next_start,
            "days": (end_day - start_day).days + 1,
            "is_arsar": False,
            "arsar_of": None,
            "status": "Стандарт",
            "season_month": expected_month,
            "overlap_days": overlap_days,
        })
        name_index += 1

    return tuple(timeline)


def _january_overlap_days(month: dict, target_year: int) -> int:
    return _count_days_in_month(
        month["start_date_obj"],
        month["end_date_obj"],
        expected_month=1,
        year=target_year,
    )


def _serialize_lunar_month(month: dict, lunar_year: int, sequence: int) -> dict:
    return {
        "lunar_year": lunar_year,
        "sequence": sequence,
        "name": month["name"],
        "base_name": month["base_name"],
        "start_date": month["start_date_obj"].isoformat(),
        "end_date": month["end_date_obj"].isoformat(),
        "start_datetime": month["start"].isoformat(),
        "end_datetime": month["end"].isoformat(),
        "next_new_moon_datetime": month["next_new_moon"].isoformat(),
        "days": month["days"],
        "is_arsar": month["is_arsar"],
        "arsar_of": month["arsar_of"],
        "status": month["status"],
        "season_month": month["season_month"],
        "overlap_days": month["overlap_days"],
    }


def calculate_lunar_year_months(year: int, tz_name: str = "Asia/Bishkek") -> list[dict]:
    """
    Return the lunar-year package for a Gregorian selector year.

    The selected package starts at the Бирдин айы that overlaps January of the
    requested year the most, then includes every following month until the next
    Бирдин айы. This deliberately allows the tail of the year to extend into
    January of the following Gregorian year.
    """
    if year < LUNAR_TIMELINE_START_YEAR or year > LUNAR_TIMELINE_END_YEAR:
        raise ValueError(f"year must be between {LUNAR_TIMELINE_START_YEAR} and {LUNAR_TIMELINE_END_YEAR}")

    timeline = calculate_lunar_month_timeline(tz_name)
    start_index: int | None = None
    max_january_days = 0

    for index, month in enumerate(timeline):
        if month["name"] != "Бирдин айы":
            continue

        january_days = _january_overlap_days(month, year)
        if january_days > max_january_days:
            max_january_days = january_days
            start_index = index

    if start_index is None:
        return []

    lunar_year_months = [timeline[start_index]]
    current_index = start_index + 1

    while current_index < len(timeline) and timeline[current_index]["name"] != "Бирдин айы":
        lunar_year_months.append(timeline[current_index])
        current_index += 1

    return [
        _serialize_lunar_month(month, lunar_year=year, sequence=sequence)
        for sequence, month in enumerate(lunar_year_months, start=1)
    ]


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


def _add_months(year: int, month: int, offset: int) -> tuple[int, int]:
    month_index = (year * 12) + (month - 1) + offset
    return month_index // 12, (month_index % 12) + 1


def _nearest_new_moon_date(target_date: date, tz_name: str) -> date:
    new_moon_dates: set[date] = set()

    for offset in (-1, 0, 1):
        phase_year, phase_month = _add_months(target_date.year, target_date.month, offset)
        for phase in calculate_moon_phases(phase_year, phase_month, tz_name):
            if phase["phase"] == "new_moon":
                new_moon_dates.add(phase["datetime"].date())

    if not new_moon_dates:
        return target_date

    return min(new_moon_dates, key=lambda new_moon_date: abs((new_moon_date - target_date).days))


def calculate_ramadan_periods(year: int, tz_name: str = "Asia/Bishkek") -> list[dict]:
    """
    Approximate Ramadan from the tabular Islamic calendar, then align Ай башы
    to the nearest local astronomical new moon for the requested timezone.
    """
    approx_islamic_year = ((year - 622) * 33) // 32
    year_start = date(year, 1, 1)
    year_end = date(year, 12, 31)
    periods: list[dict] = []

    for islamic_year in range(approx_islamic_year - 2, approx_islamic_year + 3):
        tabular_ramadan_start = islamic_to_gregorian(islamic_year, 9, 1)
        tabular_eid_al_fitr = islamic_to_gregorian(islamic_year, 10, 1)
        tabular_ai_bashi = tabular_ramadan_start - timedelta(days=1)
        tabular_ramadan_end = tabular_eid_al_fitr - timedelta(days=1)

        if tabular_ramadan_end < year_start - timedelta(days=3) or tabular_ramadan_start > year_end + timedelta(days=3):
            continue

        ai_bashi = _nearest_new_moon_date(tabular_ai_bashi, tz_name)
        ramadan_shift = ai_bashi - tabular_ai_bashi

        ramadan_start = tabular_ramadan_start + ramadan_shift
        eid_al_fitr = tabular_eid_al_fitr + ramadan_shift
        ramadan_end = eid_al_fitr - timedelta(days=1)
        kurman_ait = islamic_to_gregorian(islamic_year, 12, 10) + ramadan_shift

        if ramadan_end < year_start or ramadan_start > year_end:
            continue

        periods.append({
            "islamic_year": islamic_year,
            "start_date": max(ramadan_start, year_start),
            "end_date": min(ramadan_end, year_end),
            "eid_al_fitr": eid_al_fitr,
            "kadyr_tun": ramadan_start + timedelta(days=26),
            "ai_bashi": ai_bashi,
            "kurman_ait": kurman_ait,
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
