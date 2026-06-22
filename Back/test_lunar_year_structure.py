import unittest

from calculator import calculate_lunar_year_months, calculate_lunar_month_timeline, calculate_nooruz
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

    def test_muchol_bashy_aligns_with_jalgan_kuran_start(self):
        mismatches = []

        for year in range(1900, 2051):
            muchol_date = calculate_nooruz(year, tz_name="Asia/Bishkek").date().isoformat()
            months = calculate_lunar_year_months(year, tz_name="Asia/Bishkek")
            muchol_month = next(
                (month for month in months if month["start_date"] == muchol_date),
                None,
            )

            if muchol_month is None or muchol_month["name"] != "Жалган куран":
                mismatches.append((year, muchol_date, muchol_month["name"] if muchol_month else None))

        self.assertEqual(mismatches, [])

    def test_arsar_corrects_years_where_muchol_would_start_chyn_kuran(self):
        years_requiring_arsar_before_jalgan = [
            1901, 1904, 1907, 1912, 1915, 1918, 1920, 1923, 1926,
            1931, 1934, 1937, 1939, 1942, 1945, 1950, 1953, 1956,
            1958, 1961, 1964, 1969, 1972, 1975, 1977, 1980, 1983,
            1988, 1991, 1996, 1999, 2002, 2007, 2010, 2018, 2021,
            2026, 2029, 2032, 2037, 2040, 2045, 2048,
        ]

        for year in years_requiring_arsar_before_jalgan:
            months = calculate_lunar_year_months(year, tz_name="Asia/Bishkek")
            muchol_date = calculate_nooruz(year, tz_name="Asia/Bishkek").date().isoformat()

            self.assertEqual(months[0]["name"], "Бирдин айы", year)
            self.assertEqual(months[1]["name"], "АРСАР АЙ", year)
            self.assertTrue(months[1]["is_arsar"], year)
            self.assertEqual(months[1]["arsar_of"], "Бирдин айы", year)
            self.assertEqual(months[2]["name"], "Жалган куран", year)
            self.assertEqual(months[2]["start_date"], muchol_date, year)
            self.assertEqual(
                [month["name"] for month in months if month["is_arsar"]],
                ["АРСАР АЙ"],
                year,
            )

    def test_lunar_year_first_month_keeps_previous_month_context(self):
        months = calculate_lunar_year_months(2016, tz_name="Asia/Bishkek")

        self.assertEqual(months[0]["name"], "Бирдин айы")
        self.assertEqual(months[0]["previous_month_name"], "АРСАР АЙ")

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
