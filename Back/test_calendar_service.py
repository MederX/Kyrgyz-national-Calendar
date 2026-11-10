import asyncio
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

from calendar_service import CalendarParameters, calculate_calendar
from models import CalendarResponse


class LocalCalendarServiceTest(unittest.TestCase):
    def test_bundled_utc_astronomy_preserves_timezone_and_avoids_recomputation(self):
        from calculator import calculate_nooruz
        cache = {'2026': '2026-02-17T12:01:06.123456+00:00'}
        with patch.dict(os.environ, {'CALENDAR_OFFLINE': '1'}), \
             patch('calculator._bundled_nooruz_times', return_value=cache), \
             patch('calculator.almanac.find_discrete') as astronomy:
            local = calculate_nooruz.__wrapped__(2026, 'Asia/Bishkek')
            self.assertEqual(local.isoformat(), '2026-02-17T18:01:06.123456+06:00')
            local = calculate_nooruz.__wrapped__(2026, 'America/New_York')
            self.assertEqual(local.isoformat(), '2026-02-17T07:01:06.123456-05:00')
            astronomy.assert_not_called()

    def test_missing_mobile_ephemeris_never_falls_back_to_a_download(self):
        from calculator import _load_ephemeris
        with patch('calculator.Path') as path, patch('calculator.load') as download:
            path.return_value.resolve.return_value.with_name.return_value.is_file.return_value = False
            with patch.dict(os.environ, {'CALENDAR_OFFLINE': '1'}):
                with self.assertRaisesRegex(FileNotFoundError, 'Bundled calendar ephemeris'):
                    _load_ephemeris()
                download.assert_not_called()
            with patch.dict(os.environ):
                os.environ.pop('CALENDAR_OFFLINE', None)
                _load_ephemeris()
                download.assert_called_once_with('de421.bsp')

    def test_coincident_events_and_previous_lunar_context(self):
        data = calculate_calendar(CalendarParameters(2026, 42.8746, 74.5698))
        response = CalendarResponse.model_validate(data)
        events = [event.type for event in response.events if event.date == '2026-02-17']
        self.assertCountEqual(events, ['new_moon', 'nooruz', 'ai_bashi'])
        self.assertEqual(response.lunar_months[0].name, 'Бирдин айы')
        self.assertEqual(len(response.lunar_months), 13)

    def test_fastapi_adapter_preserves_the_same_response(self):
        from main import get_calendar_events
        from models import CalendarRequest
        parameters = dict(year=2026, latitude=40.7128, longitude=-74.0060,
                          tz_name='America/New_York')
        expected = CalendarResponse.model_validate(calculate_calendar(CalendarParameters(**parameters)))
        actual = asyncio.run(get_calendar_events(CalendarRequest(**parameters)))
        self.assertEqual(actual.model_dump(), expected.model_dump())

    def test_cold_calculation_without_network_or_working_directory_data(self):
        source_dir = str(Path(__file__).resolve().parent)
        code = f'''
import socket, sys
def blocked(*args, **kwargs):
    raise AssertionError("Calendar attempted network access")
socket.socket.connect = blocked
socket.create_connection = blocked
sys.path.insert(0, {source_dir!r})
from calendar_service import CalendarParameters, calculate_calendar
data = calculate_calendar(CalendarParameters(2026, 42.8746, 74.5698))
assert data['year'] == 2026 and len(data['lunar_months']) == 13
assert any(e['type'] == 'togool' for e in data['events'])
'''
        with tempfile.TemporaryDirectory() as directory:
            subprocess.run([sys.executable, '-c', code], cwd=directory,
                           check=True, timeout=180, capture_output=True, text=True)


if __name__ == '__main__':
    unittest.main()
