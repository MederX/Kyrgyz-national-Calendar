"""On-device entry point. No HTTP server, network calls or downloaded data."""

from functools import lru_cache
import json
import math
import os
from zoneinfo import ZoneInfo

os.environ['CALENDAR_OFFLINE'] = '1'
from calendar_service import CalendarParameters, calculate_calendar


@lru_cache(maxsize=24)
def _calculate(parameters):
    return json.dumps(calculate_calendar(parameters), ensure_ascii=False)


def calculate(payload):
    values = json.loads(payload)
    if not isinstance(values, dict):
        raise ValueError('Calendar parameters must be an object')
    year = values.get('year')
    if type(year) is not int or not 1900 <= year <= 2050:
        raise ValueError('Year must be between 1900 and 2050')
    for name, limit in [('latitude', 90), ('longitude', 180)]:
        value = values.get(name)
        if type(value) not in (int, float) or not math.isfinite(value) or abs(value) > limit:
            raise ValueError('Invalid ' + name)
    month = values.get('month')
    if month is not None and (type(month) is not int or not 1 <= month <= 12):
        raise ValueError('Invalid month')
    elevation = values.get('elevation_m', 800.0)
    if type(elevation) not in (int, float) or not math.isfinite(elevation):
        raise ValueError('Invalid elevation')
    timezone = values.get('tz_name', 'Asia/Bishkek')
    if not isinstance(timezone, str):
        raise ValueError('Invalid timezone')
    ZoneInfo(timezone)
    return _calculate(CalendarParameters(year, values['latitude'], values['longitude'],
                                         month, elevation, timezone))
