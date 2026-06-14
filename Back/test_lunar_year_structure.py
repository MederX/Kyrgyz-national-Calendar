import unittest

from calculator import calculate_lunar_year_months, calculate_lunar_month_timeline
from calculator import KYRGYZ_LUNAR_MONTH_NAMES


class LunarYearStructureTest(unittest.TestCase):
    def test_lunar_year_starts_with_birdin_and_stops_before_next_birdin(self):
        months = calculate_lunar_year_months(2026, tz_name="Asia/Bishkek")

        self.assertGreaterEqual(len(months), 12)
        self.assertLessEqual(len(months), 13)
        self.assertEqual(months[0]["name"], "Бирдин айы")
        self.assertEqual(months[-1]["name"], "Үчтүн айы")
        self.assertTrue(months[-1]["end_date"].startswith("2027-"))

    def test_lunar_year_exists_for_every_supported_year(self):
        empty_years = []

        for year in range(1900, 2051):
            months = calculate_lunar_year_months(year, tz_name="Asia/Bishkek")
            if not months:
                empty_years.append(year)
                continue

            self.assertIn(len(months), (12, 13), year)
            self.assertEqual(months[0]["name"], "Бирдин айы", year)

        self.assertEqual(empty_years, [])

    def test_each_lunar_year_keeps_regular_month_order(self):
        for year in range(1900, 2051):
            months = calculate_lunar_year_months(year, tz_name="Asia/Bishkek")
            regular_month_names = [month["name"] for month in months if not month["is_arsar"]]

            self.assertEqual(regular_month_names, KYRGYZ_LUNAR_MONTH_NAMES, year)

    def test_arsar_months_use_300_day_cooldown(self):
        timeline = calculate_lunar_month_timeline(tz_name="Asia/Bishkek")
        arsar_months = [month for month in timeline if month["is_arsar"]]

        self.assertTrue(arsar_months)
        self.assertTrue(all(month["name"] == "АРСАР АЙ" for month in arsar_months))
        self.assertTrue(all(month["arsar_of"] for month in arsar_months))
        for previous, current in zip(arsar_months, arsar_months[1:]):
            self.assertGreaterEqual(
                (current["start"] - previous["start"]).days,
                300,
            )

    def test_api_payload_uses_json_safe_dates(self):
        months = calculate_lunar_year_months(2026, tz_name="Asia/Bishkek")
        first = months[0]

        self.assertIn("start_date", first)
        self.assertIn("end_date", first)
        self.assertIsInstance(first["start_date"], str)
        self.assertIsInstance(first["end_date"], str)
        self.assertNotIn("start", first)
        self.assertNotIn("end", first)


if __name__ == "__main__":
    unittest.main()
