# Kyrgyz Root Calendar

Backend on FastAPI computes astronomical events for a Kyrgyz traditional calendar. Frontend on React/Vite renders a yearly calendar with moon phases, Togool events, Ramadan, Eid al-Fitr, Muchol start, and state holidays.

## Structure

- `Back/`: FastAPI API and astronomical calculations
- `Front/`: React + Vite client

## Backend

```bash
cd Back
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend expects `de421.bsp` to be present in `Back/`.

## Frontend

```bash
cd Front
npm install
npm run dev
```

Optional environment variable:

```bash
VITE_API_BASE_URL=/api
```

In local development Vite proxies `/api` to `http://localhost:8000`.

## Notes

- Timezone handling is based on IANA timezone names such as `Asia/Bishkek` or `America/New_York`.
- Ramadan dates are calculated with a tabular Islamic calendar approximation for UI planning.
