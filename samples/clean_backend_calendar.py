import ephem
from datetime import datetime, timedelta, timezone

KYRGYZ_NAMES = [
    "Бирдин айы", "Жалган куран", "Чын куран", "Бугу", 
    "Кулжа", "Теке", "Баш оона", "Аяк оона", 
    "Тогуздун айы", "Жетинин айы", "Бештин айы", "Үчтүн айы"
]

def get_clean_backend_calendar(target_year):
    bishkek_tz = timezone(timedelta(hours=6))
    
    # 1. Генерируем сплошную ленту новолуний с огромным запасом
    start_search = ephem.Date(datetime(1899, 11, 1))
    end_search = ephem.Date(datetime(2052, 3, 1))
    
    moons = []
    current = start_search
    while current < end_search:
        next_nm = ephem.next_new_moon(current)
        nm_local = next_nm.datetime().replace(tzinfo=timezone.utc).astimezone(bishkek_tz)
        moons.append(nm_local)
        current = next_nm + ephem.second

    # Сплошной массив лунных месяцев без привязки к годам
    all_lunar_months = []
    for i in range(len(moons) - 1):
        all_lunar_months.append({
            'start': moons[i],
            'end': moons[i+1] - timedelta(seconds=1),
            'name': None,
            'status': "Стандарт"
        })

    # 2. Глобальная разметка имён и Арсар ай по всей временной шкале (1900-2050)
    global_timeline = []
    name_idx = 0
    cooldown_until = datetime(1900, 1, 1, tzinfo=bishkek_tz)

    for lm in all_lunar_months:
        # Эпоха: стартуем строго с великого новолуния 1 января 1900 года
        if lm['start'] < datetime(1900, 1, 1, 19, 51, tzinfo=bishkek_tz):
            continue
            
        current_name = KYRGYZ_NAMES[name_idx % 12]
        expected_grid_month = (name_idx % 12) + 1
        
        # Считаем пересечение (overlap)
        overlap_days = 0
        curr_date = lm['start']
        while curr_date <= lm['end']:
            if curr_date.month == expected_grid_month:
                overlap_days += 1
            curr_date += timedelta(days=1)

        # Проверка триггера Арсар ай
        if overlap_days < 10 and lm['start'] > cooldown_until:
            prev_name = KYRGYZ_NAMES[(name_idx - 1) % 12]
            lm['name'] = f"АРСАР АЙ (Кош {prev_name})"
            lm['status'] = "КРИТИЧЕСКИЙ БУФЕР"
            cooldown_until = lm['end'] + timedelta(days=300)
            global_timeline.append(lm)
            continue 
            
        lm['name'] = current_name
        global_timeline.append(lm)
        name_idx += 1

    # 3. ИСПРАВЛЕННАЯ ЛОГИКА ФИЛЬТРАЦИИ ДЛЯ БЭКЕНДА:
    # Ищем "Бирдин айы", который максимально перекрывает ЯНВАРЬ целевого года (target_year)
    start_index = None
    max_january_days = 0

    for idx, lm in enumerate(global_timeline):
        if lm['name'] == "Бирдин айы":
            # Считаем, сколько дней этот конкретный "Бирдин айы" проводит внутри января target_year
            january_days = 0
            curr_date = lm['start']
            while curr_date <= lm['end']:
                if curr_date.year == target_year and curr_date.month == 1:
                    january_days += 1
                curr_date += timedelta(days=1)
            
            # Нам нужен тот "Бирдин айы", у которого пересечение с январём максимально
            if january_days > max_january_days:
                max_january_days = january_days
                start_index = idx

    # Собираем лунный год от найденного Бирдин айы до следующего Бирдин айы
    lunar_year_package = []
    if start_index is not None:
        curr_idx = start_index
        lunar_year_package.append(global_timeline[curr_idx])
        curr_idx += 1
        
        while curr_idx < len(global_timeline) and global_timeline[curr_idx]['name'] != "Бирдин айы":
            lunar_year_package.append(global_timeline[curr_idx])
            curr_idx += 1
    # Вывод результата для бэкенд API
    print(f"=== БЭКЕНД API: Данные для Лунного Цикла {target_year} года ===")
    print(f"{'Кыргызский месяц':<24} | {'Начало':<10} | {'Конец месяца':<10} | Статус")
    print("-" * 85)
    for lm in lunar_year_package:
        print(f"{lm['name']:<24} | {lm['start'].strftime('%Y-%m-%d')} | {lm['end'].strftime('%Y-%m-%d')} | {lm['status']}")
