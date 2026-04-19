"""Pydantic models for the Kyrgyz Calendar API."""

from pydantic import BaseModel, Field
from typing import Literal


class CalendarRequest(BaseModel):
    year: int
    month: int | None = None
    latitude: float
    longitude: float
    elevation_m: float = 800.0
    tz_name: str = "Asia/Bishkek"


class CalendarEvent(BaseModel):
    date: str          # "2025-06-18"
    time: str          # "20:45"
    type: Literal["new_moon", "full_moon", "togool", "nooruz", "holiday", "eid_al_fitr", "kadyr_tun", "ai_bashi", "kurman_ait"]
    label_ky: str
    label_ru: str
    description_ky: str
    description_ru: str
    tips_ky: str | None = None
    tips_ru: str | None = None


class CalendarPeriod(BaseModel):
    start_date: str
    end_date: str
    type: Literal["ramadan"]
    label_ky: str
    label_ru: str
    description_ky: str
    description_ru: str


class CalendarResponse(BaseModel):
    year: int
    month: int | None = None
    events: list[CalendarEvent]
    periods: list[CalendarPeriod]
