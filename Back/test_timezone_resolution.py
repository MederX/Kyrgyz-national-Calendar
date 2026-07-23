import unittest
from zoneinfo import ZoneInfo


class TimezoneResolutionTests(unittest.TestCase):
    def test_asia_bishkek_timezone_is_available(self) -> None:
        tz = ZoneInfo('Asia/Bishkek')
        self.assertEqual(tz.key, 'Asia/Bishkek')


if __name__ == '__main__':
    unittest.main()
