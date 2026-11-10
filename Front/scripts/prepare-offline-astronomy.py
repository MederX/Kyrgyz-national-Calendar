"""Prime location-independent year-start astronomy during APK compilation."""

import argparse
import hashlib
import json
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(root / 'Back'))
from calculator import calculate_nooruz

parser = argparse.ArgumentParser()
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
years = {str(year): calculate_nooruz(year, 'UTC').isoformat()
         for year in range(1900, 2053)}
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(json.dumps({
    'kernel_sha256': hashlib.sha256((root / 'Back/de421.bsp').read_bytes()).hexdigest(),
    'years': years,
}, ensure_ascii=False), encoding='utf-8')
print(f'Prepared {len(years)} UTC year-start instants for offline startup')
