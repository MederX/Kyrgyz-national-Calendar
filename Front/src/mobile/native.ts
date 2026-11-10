import { useEffect, useRef } from 'react';
import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Geolocation } from '@capacitor/geolocation';

export function useNativeLifecycle(onBack: () => boolean, onResume: () => void, theme: 'light' | 'dark') {
    const back = useRef(onBack), resume = useRef(onResume);
    back.current = onBack;
    resume.current = onResume;
    useEffect(() => {
        if (Capacitor.isNativePlatform()) void SystemBars.setStyle({ style: theme === 'dark' ? SystemBarsStyle.Dark : SystemBarsStyle.Light });
    }, [theme]);
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;
        const listeners = [
            App.addListener('backButton', () => { if (!back.current()) void App.exitApp(); }),
            App.addListener('appStateChange', state => { if (state.isActive) resume.current(); }),
        ];
        return () => { listeners.forEach(listener => { void listener.then(handle => handle.remove()); }); };
    }, []);
}

export async function getNativeCoordinates(): Promise<{ latitude: number; longitude: number }> {
    if (Capacitor.isNativePlatform()) {
        const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10_000 });
        return { latitude: position.coords.latitude, longitude: position.coords.longitude };
    }
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) { reject(new Error('Geolocation is unavailable')); return; }
        navigator.geolocation.getCurrentPosition(position => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }), reject, { enableHighAccuracy: true, timeout: 10_000 });
    });
}
