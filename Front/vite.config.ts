import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { createMobileBuildMetadata } from './mobileBuild';
import capacitorConfig from './capacitor.config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode, command }) => {
    const mobile = mode === 'mobile';
    const mobileMetadata = mobile && command === 'build' ? createMobileBuildMetadata(capacitorConfig) : undefined;
    return {
        base: mobile ? './' : '/',
        publicDir: mobile ? false : 'public',
        build: { outDir: mobile ? 'dist-mobile' : 'dist' },
        plugins: [
            react(),
            ...(mobile ? [{
                name: 'mobile-entry',
                transformIndexHtml: { order: 'pre' as const, handler: () => readFileSync(new URL('./mobile.html', import.meta.url), 'utf8') },
            generateBundle() {
                this.emitFile({ type: 'asset', fileName: 'mobile-build.json', source: JSON.stringify(mobileMetadata) });
            },
            }] : [VitePWA({
                registerType: 'autoUpdate',
                devOptions: {
                    enabled: true,
                },
                manifest: {
                    name: 'Кыргыз Тамыр Календары',
                    short_name: 'Кыргыз Календары',
                    description: 'Traditional Kyrgyz astronomical calendar with moon phases and Togool events',
                    theme_color: '#0F172A',
                    background_color: '#0F172A',
                },
                workbox: {
                    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                    runtimeCaching: [
                        {
                            urlPattern: /^https:\/\/nominatim\.openstreetmap\.org\/.*/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'nominatim-cache',
                                expiration: {
                                    maxEntries: 10,
                                    maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
                                },
                                cacheableResponse: {
                                    statuses: [0, 200]
                                }
                            }
                        },
                        {
                            urlPattern: /\/api\/calendar\/events/i,
                            handler: 'NetworkFirst',
                            options: {
                                cacheName: 'calendar-api-cache',
                                expiration: {
                                    maxEntries: 50,
                                    maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
                                },
                                networkTimeoutSeconds: 5,
                                cacheableResponse: {
                                    statuses: [0, 200]
                                }
                            }
                        }
                    ]
                }
            })])
        ],
        server: {
            port: mobile ? 5178 : 5173,
            watch: { ignored: ['**/android/**', '**/dist-mobile/**'] },
            proxy: {
                '/api': {
                    target: 'http://localhost:8000',
                    changeOrigin: true,
                },
            },
        },
    };
});
