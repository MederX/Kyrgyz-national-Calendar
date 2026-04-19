import React, { useState } from 'react';
import type { LatLon, Language } from '../types/calendar.types';
import styles from './LocationSelector.module.css';

interface Props {
    currentLocation: LatLon;
    onSelect: (loc: LatLon) => void;
    onClose: () => void;
    language: Language;
}

const CITIES: LatLon[] = [
    // Kyrgyzstan
    { latitude: 42.8746, longitude: 74.5698, cityName: 'Бишкек', timeZone: 'Asia/Bishkek' },
    { latitude: 40.5283, longitude: 72.7985, cityName: 'Ош', timeZone: 'Asia/Bishkek' },
    { latitude: 42.4602, longitude: 75.9864, cityName: 'Нарын', timeZone: 'Asia/Bishkek' },
    { latitude: 42.4550, longitude: 78.3948, cityName: 'Каракол', timeZone: 'Asia/Bishkek' },
    { latitude: 40.9329, longitude: 73.0000, cityName: 'Жалал-Абад', timeZone: 'Asia/Bishkek' },
    { latitude: 39.6531, longitude: 69.5570, cityName: 'Баткен', timeZone: 'Asia/Bishkek' },

    // Central Asia & CIS
    { latitude: 43.2220, longitude: 76.8512, cityName: 'Алматы', timeZone: 'Asia/Almaty' },
    { latitude: 51.1605, longitude: 71.4704, cityName: 'Астана', timeZone: 'Asia/Almaty' },
    { latitude: 41.2995, longitude: 69.2401, cityName: 'Ташкент', timeZone: 'Asia/Tashkent' },
    { latitude: 55.7558, longitude: 37.6173, cityName: 'Москва', timeZone: 'Europe/Moscow' },

    // Global Capitals
    { latitude: 40.7128, longitude: -74.0060, cityName: 'Нью-Йорк', timeZone: 'America/New_York' },
    { latitude: 38.8951, longitude: -77.0364, cityName: 'Вашингтон', timeZone: 'America/New_York' },
    { latitude: 51.5074, longitude: -0.1278, cityName: 'Лондон', timeZone: 'Europe/London' },
    { latitude: 48.8566, longitude: 2.3522, cityName: 'Париж', timeZone: 'Europe/Paris' },
    { latitude: 52.5200, longitude: 13.4050, cityName: 'Берлин', timeZone: 'Europe/Berlin' },
    { latitude: 41.9028, longitude: 12.4964, cityName: 'Рим', timeZone: 'Europe/Rome' },
    { latitude: 41.0082, longitude: 28.9784, cityName: 'Стамбул', timeZone: 'Europe/Istanbul' },
    { latitude: 25.2769, longitude: 55.2962, cityName: 'Дубай', timeZone: 'Asia/Dubai' },
    { latitude: 39.9042, longitude: 116.4074, cityName: 'Пекин', timeZone: 'Asia/Shanghai' },
    { latitude: 35.6762, longitude: 139.6503, cityName: 'Токио', timeZone: 'Asia/Tokyo' },
];


export const LocationSelector: React.FC<Props> = ({
    currentLocation,
    onSelect,
    onClose,
    language,
}) => {
    const [search, setSearch] = useState('');
    const [geoLoading, setGeoLoading] = useState(false);

    const filtered = CITIES.filter((c) =>
        c.cityName.toLowerCase().includes(search.toLowerCase())
    );

    const handleGeolocate = async () => {
        if (!navigator.geolocation) return;
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                let cityName = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                        { headers: { 'User-Agent': 'KyrgyzCalendar/1.0' } }
                    );
                    const data = await res.json();
                    cityName =
                        data.address?.city ||
                        data.address?.town ||
                        data.address?.village ||
                        cityName;
                } catch {
                    // fallback to coordinates
                }
                onSelect({
                    latitude,
                    longitude,
                    cityName,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
                });
                setGeoLoading(false);
                onClose();
            },
            () => setGeoLoading(false),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>{language === 'ky' ? 'Жайгашуу тандоо' : 'Выбор локации'}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <button
                    className={styles.geoBtn}
                    onClick={handleGeolocate}
                    disabled={geoLoading}
                >
                    📍{' '}
                    {geoLoading
                        ? language === 'ky'
                            ? 'Аныкталууда...'
                            : 'Определение...'
                        : language === 'ky'
                            ? 'Геолокацияны колдонуу'
                            : 'Использовать геолокацию'}
                </button>

                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder={language === 'ky' ? 'Шаар издөө...' : 'Поиск города...'}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className={styles.cityList}>
                    {filtered.map((city) => (
                        <button
                            key={city.cityName}
                            className={`${styles.cityBtn} ${city.cityName === currentLocation.cityName
                                ? styles.cityBtnActive
                                : ''
                                }`}
                            onClick={() => {
                                onSelect(city);
                                onClose();
                            }}
                        >
                            <span className={styles.cityName}>{city.cityName}</span>
                            <span className={styles.cityCoords}>
                                {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
