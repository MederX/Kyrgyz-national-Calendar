import unittest
from datetime import timedelta

from calculator import calculate_moon_phases, calculate_ramadan_periods, islamic_to_gregorian


class RamadanAlignmentTest(unittest.TestCase):
    def test_ramadan_starts_day_after_local_new_moon(self):
        periods = calculate_ramadan_periods(2027, tz_name="Asia/Bishkek")
        ramadan = next(period for period in periods if period["ai_bashi"].year == 2027)

        new_moon_dates = [
            phase["datetime"].date()
            for phase in calculate_moon_phases(2027, tz_name="Asia/Bishkek")
            if phase["phase"] == "new_moon"
        ]

        self.assertIn(ramadan["ai_bashi"], new_moon_dates)
        self.assertEqual(ramadan["start_date"], ramadan["ai_bashi"] + timedelta(days=1))

    def test_kurman_ait_uses_same_alignment_shift_as_ramadan(self):
        periods = calculate_ramadan_periods(2027, tz_name="Asia/Bishkek")
        ramadan = next(period for period in periods if period["ai_bashi"].year == 2027)

        tabular_ramadan_start = islamic_to_gregorian(ramadan["islamic_year"], 9, 1)
        tabular_kurman_ait = islamic_to_gregorian(ramadan["islamic_year"], 12, 10)
        ramadan_shift = ramadan["start_date"] - tabular_ramadan_start

        self.assertEqual(ramadan["kurman_ait"], tabular_kurman_ait + ramadan_shift)


if __name__ == "__main__":
    unittest.main()
