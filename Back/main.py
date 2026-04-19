"""
FastAPI backend for the Kyrgyz Root Calendar.

Endpoint: POST /api/calendar/events
Returns new-moon, full-moon, and togool events for a given month + location.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import CalendarRequest, CalendarResponse, CalendarEvent, CalendarPeriod
from calculator import (
    calculate_togoshuu,
    calculate_moon_phases,
    calculate_nooruz,
    calculate_ramadan_periods,
)

app = FastAPI(title="Кыргыз Тамыр Календары API")

# ── CORS ──────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Labels & descriptions ─────────────────────────────────────────────────

EVENT_META = {
    "new_moon": {
        "label_ky": "Ай жаңырган күн",
        "label_ru": "Новолуние",
        "description_ky": "Айдын жаңы циклинин башталышы",
        "description_ru": "Начало нового лунного цикла",
        "tips_ky": "Жаңы пландарды баштоого жана ниет кылууга эң жакшы убакыт.",
        "tips_ru": "Лучшее время для начала новых дел и постановки целей.",
    },
    "full_moon": {
        "label_ky": "Ай толгон күн",
        "label_ru": "Полнолуние",
        "description_ky": "Ай толук жарык болот",
        "description_ru": "Луна в полной фазе",
        "tips_ky": "Энергиянын туу чокусу. Сабырдуу болуу жана талаш-тартыштан качуу сунушталат.",
        "tips_ru": "Пик энергии. Рекомендуется проявлять терпение и избегать конфликтов.",
    },
    "togool": {
        "label_ky": "Тоогол",
        "label_ru": "Тоогол (Луна у Плеяд)",
        "description_ky": "Ай менен Үркөр топ жылдызынын тогошуусу",
        "description_ru": "Сближение Луны с Плеядами (созвездие Тельца)",
        "tips_ky": "Аба ырайынын өзгөрүшүнө даяр болуңуз. Тоют топтоо жана мал-жандыкка кам көрүү зарыл.",
        "tips_ru": "Готовьтесь к перемене погоды. Важно позаботиться о скоте и запасах корма.",
    },
    "nooruz": {
        "label_ky": "Мүчөл башы (Жаңы Жыл)",
        "label_ru": "Начало Года (Мүчөл)",
        "description_ky": "Жаздын келиши жана жаңы жылдын башталышы",
        "description_ru": "Весеннее равноденствие, смена животного цикла",
        "tips_ky": "Өзүңдү өнүктүрүү жана келечекке багыт алуу үчүн эң маанилүү учур.",
        "tips_ru": "Важный момент для саморазвития и планирования будущего года.",
    },
    "eid_al_fitr": {
        "label_ky": "Орозо айт",
        "label_ru": "Орозо айт (Ид аль-Фитр)",
        "description_ky": "Рамазан айы аяктап, айт майрамы башталат",
        "description_ru": "Завершение месяца Рамазан и начало праздника айт",
    },
    "kadyr_tun": {
        "label_ky": "Кадыр түн",
        "label_ru": "Ночь Предопределения (Кадыр түн)",
        "description_ky": "Рамазан айынын 27-түнү, берекелүү жана ыйык түн",
        "description_ru": "27-я ночь месяца Рамазан, священная Ночь Предопределения",
    },
    "ai_bashi": {
        "label_ky": "Ай башы (четтик)",
        "label_ru": "Начало рамадана (Ай башы)",
        "description_ky": "Рамазан айынын алдындагы күн, орозого даярдык",
        "description_ru": "День перед началом Рамазана, подготовка к посту",
    },
    "kurman_ait": {
        "label_ky": "Курман айт",
        "label_ru": "Курман айт (Ид аль-Адха)",
        "description_ky": "Ыйык Курман айт майрамы",
        "description_ru": "Священный праздник Курман айт",
    },
}

STATE_HOLIDAYS = {
    "01-01": {"label_ky": "Жаңы Жыл", "label_ru": "Новый год", "description_ky": "Мамлекеттик майрам", "description_ru": "Государственный праздник"},
    "02-23": {"label_ky": "Ата Мекенди коргоочулардын күнү", "label_ru": "День защитника Отечества", "description_ky": "Мамлекеттик майрам", "description_ru": "Государственный праздник"},
    "03-08": {"label_ky": "Аялдардын эл аралык күнү", "label_ru": "Международный женский день", "description_ky": "Мамлекеттик майрам", "description_ru": "Государственный праздник"},
    "03-21": {"label_ky": "Нооруз элдик майрамы", "label_ru": "Народный праздник Нооруз", "description_ky": "Улуттук майрам", "description_ru": "Национальный праздник"},
    "04-07": {"label_ky": "Элдик Апрель революциясы күнү", "label_ru": "День народной Апрельской революции", "description_ky": "Мамлекеттик майрам", "description_ru": "Государственный праздник"},
    "05-01": {"label_ky": "Эмгек майрамы", "label_ru": "Праздник труда", "description_ky": "Мамлекеттик майрам", "description_ru": "Государственный праздник"},
    "05-05": {"label_ky": "КР Конституциясы күнү", "label_ru": "День Конституции КР", "description_ky": "Мамлекеттик майрам", "description_ru": "Государственный праздник"},
    "05-09": {"label_ky": "Жеңиш күнү", "label_ru": "День Победы", "description_ky": "Мамлекеттик майрам", "description_ru": "Государственный праздник"},
    "08-31": {"label_ky": "КР Эгемендүүлүк күнү", "label_ru": "День независимости КР", "description_ky": "Башкы мамлекеттик майрам", "description_ru": "Главный государственный праздник"},
    "11-07": {"label_ky": "Тарых жана ата-бабаларды эскерүү күнү", "label_ru": "День истории и памяти предков", "description_ky": "Мамлекеттик майрам", "description_ru": "Государственный праздник"},
    "11-08": {"label_ky": "Тарых жана ата-бабаларды эскерүү күнү", "label_ru": "День истории и памяти предков", "description_ky": "Мамлекеттик майрам", "description_ru": "Государственный праздник"}
}

ANIMALS_KY = ['Чычкан', 'Уй', 'Барс', 'Коён', 'Улуу', 'Жылан', 'Жылкы', 'Кой', 'Маймыл', 'Тоок', 'Ит', 'Доңуз']
ANIMALS_RU = ['Мышь', 'Корова', 'Барс', 'Заяц', 'Дракон', 'Змея', 'Лошадь', 'Овца', 'Обезьяна', 'Петух', 'Собака', 'Кабан']

def get_animal(year: int):
    return ANIMALS_KY[(year - 4) % 12], ANIMALS_RU[(year - 4) % 12]

# ── Endpoint ──────────────────────────────────────────────────────────────

@app.post("/api/calendar/events", response_model=CalendarResponse)
async def get_calendar_events(req: CalendarRequest) -> CalendarResponse:
    """
    Compute astronomical events for the requested month/location.
    """
    events: list[CalendarEvent] = []
    periods: list[CalendarPeriod] = []

    # 1. Moon phases (new moon + full moon) for the requested month or year
    moon_phases = calculate_moon_phases(
        year=req.year,
        month=req.month,
        tz_name=req.tz_name,
    )
    for mp in moon_phases:
        dt = mp["datetime"]
        meta = EVENT_META[mp["phase"]]
        events.append(CalendarEvent(
            date=dt.strftime("%Y-%m-%d"),
            time=dt.strftime("%H:%M"),
            type=mp["phase"],
            **meta,
        ))

    # 2. Togool (Pleiades conjunctions) — computed for the full year, filtered if month is present
    togool_dates = calculate_togoshuu(
        year=req.year,
        lat=req.latitude,
        lon=req.longitude,
        elevation_m=req.elevation_m,
        tz_name=req.tz_name,
    )
    meta = EVENT_META["togool"]
    for dt in togool_dates:
        if req.month is None or dt.month == req.month:
            events.append(CalendarEvent(
                date=dt.strftime("%Y-%m-%d"),
                time=dt.strftime("%H:%M"),
                type="togool",
                **meta,
            ))

    # 3. Nooruz (Astronomical Spring Equinox)
    nooruz_dt = calculate_nooruz(
        year=req.year,
        tz_name=req.tz_name,
    )
    if req.month is None or nooruz_dt.month == req.month:
        animal_ky, animal_ru = get_animal(req.year)
        events.append(CalendarEvent(
            date=nooruz_dt.strftime("%Y-%m-%d"),
            time=nooruz_dt.strftime("%H:%M"),
            type="nooruz",
            label_ky=f"Мүчөл башы ({animal_ky} жылы)",
            label_ru=f"Начало года (Год {animal_ru})",
            description_ky=EVENT_META["nooruz"]["description_ky"],
            description_ru=EVENT_META["nooruz"]["description_ru"],
            tips_ky=EVENT_META["nooruz"]["tips_ky"],
            tips_ru=EVENT_META["nooruz"]["tips_ru"],
            ))

    # 4. Ramadan period + Eid al-Fitr
    ramadan_periods = calculate_ramadan_periods(req.year)
    for period in ramadan_periods:
        start_date = period["start_date"]
        end_date = period["end_date"]
        eid_date = period["eid_al_fitr"]

        if req.month is None or start_date.month == req.month or end_date.month == req.month:
            periods.append(CalendarPeriod(
                start_date=start_date.isoformat(),
                end_date=end_date.isoformat(),
                type="ramadan",
                label_ky="Рамазан",
                label_ru="Месяц Рамадан",
                description_ky="Орозо кармалган ыйык айдын мезгили",
                description_ru="Период священного месяца поста",
            ))

        if req.month is None or eid_date.month == req.month:
            meta = EVENT_META["eid_al_fitr"]
            events.append(CalendarEvent(
                date=eid_date.isoformat(),
                time="00:00",
                type="eid_al_fitr",
                **meta,
            ))

        kadyr_date = period["kadyr_tun"]
        if req.month is None or kadyr_date.month == req.month:
            meta = EVENT_META["kadyr_tun"]
            events.append(CalendarEvent(
                date=kadyr_date.isoformat(),
                time="00:00",
                type="kadyr_tun",
                **meta,
            ))

        ai_bashi_date = period["ai_bashi"]
        if req.month is None or ai_bashi_date.month == req.month:
            meta = EVENT_META["ai_bashi"]
            events.append(CalendarEvent(
                date=ai_bashi_date.isoformat(),
                time="00:00",
                type="ai_bashi",
                **meta,
            ))

        kurman_ait_date = period["kurman_ait"]
        if req.month is None or kurman_ait_date.month == req.month:
            meta = EVENT_META["kurman_ait"]
            events.append(CalendarEvent(
                date=kurman_ait_date.isoformat(),
                time="00:00",
                type="kurman_ait",
                **meta,
            ))

    # 5. State Holidays
    for date_mmdd, meta in STATE_HOLIDAYS.items():
        m_str, d_str = date_mmdd.split('-')
        holiday_month = int(m_str)
        if req.month is None or holiday_month == req.month:
            events.append(CalendarEvent(
                date=f"{req.year}-{date_mmdd}",
                time="00:00",
                type="holiday",
                **meta
            ))

    # 6. Sort by date ascending
    events.sort(key=lambda e: (e.date, e.time))
    periods.sort(key=lambda period: period.start_date)

    return CalendarResponse(
        year=req.year,
        month=req.month,
        events=events,
        periods=periods,
    )
