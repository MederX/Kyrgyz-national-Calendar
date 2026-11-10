"""FastAPI adapter for the shared calendar engine."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import CalendarRequest, CalendarResponse
from calendar_service import CalendarParameters, calculate_calendar

app = FastAPI(title="Кыргыз Тамыр Календары API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/calendar/events", response_model=CalendarResponse)
async def get_calendar_events(req: CalendarRequest) -> CalendarResponse:
    return CalendarResponse.model_validate(
        calculate_calendar(CalendarParameters(**req.model_dump()))
    )
