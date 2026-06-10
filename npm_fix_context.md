# Контекст исправления npm install / npm audit

Дата: 2026-04-28

## Исходная проблема

В файле `problems.txt` были ошибки после запуска:

```bash
cd Front
npm audit
npm audit fix --force
npm audit fix
```

Основная ошибка:

```text
npm error ERESOLVE could not resolve
```

Причина: команда `npm audit fix --force` обновила `vite` до `8.0.10`.
Но установленные версии плагинов были несовместимы с Vite 8:

```text
@vitejs/plugin-react@4.7.0 поддерживал vite ^4 || ^5 || ^6 || ^7
vite-plugin-pwa@0.19.8 поддерживал vite ^3 || ^4 || ^5
```

Из-за этого `npm install` / `npm audit fix` попадали в конфликт peer dependencies.

## Что было проверено

Выполнены команды:

```bash
ls
sed -n '1,240p' problems.txt
sed -n '1,240p' Front/package.json
node -v
npm -v
sed -n '1,220p' Front/vite.config.ts
npm ls vite @vitejs/plugin-react vite-plugin-pwa esbuild serialize-javascript
```

Окружение:

```text
node: v24.15.0
npm: 11.13.0
```

## Первое восстановление

Сначала `vite` был возвращен на совместимую ветку:

```json
"vite": "^5.4.21"
```

После этого `npm install` прошел, а `npm run build` успешно собрал проект.

Но `npm audit` все еще показывал уязвимости в:

```text
esbuild <=0.24.2
serialize-javascript <=7.0.4
```

## Финальное решение

Чтобы убрать уязвимости и не сломать совместимость, зависимости были обновлены до согласованного набора:

```json
"vite": "^7.3.2",
"vite-plugin-pwa": "^1.2.0"
```

Также добавлен override:

```json
"overrides": {
    "serialize-javascript": "7.0.5"
}
```

Измененные файлы:

```text
Front/package.json
Front/package-lock.json
```

## Финальные проверки

Команда:

```bash
cd Front
npm install
```

Результат:

```text
added 2 packages, removed 20 packages, changed 5 packages, and audited 375 packages
found 0 vulnerabilities
```

Команда:

```bash
npm ls vite @vitejs/plugin-react vite-plugin-pwa serialize-javascript
```

Результат:

```text
kyrgyz-calendar-frontend@1.0.0
├─┬ @vitejs/plugin-react@4.7.0
│ └── vite@7.3.2 deduped
├─┬ vite-plugin-pwa@1.2.0
│ ├── vite@7.3.2 deduped
│ └─┬ workbox-build@7.4.0
│   └─┬ @rollup/plugin-terser@0.4.4
│     └── serialize-javascript@7.0.5 overridden
└── vite@7.3.2
```

Команда:

```bash
npm run build
```

Результат:

```text
vite v7.3.2 building client environment for production...
✓ 459 modules transformed.
✓ built in 1.13s

PWA v1.2.0
mode      generateSW
precache  6 entries
files generated
  dist/sw.js
  dist/workbox-58bd4dca.js
```

Команда:

```bash
npm audit
```

Результат:

```text
found 0 vulnerabilities
```

## Как теперь запускать проект

Фронтенд:

```bash
cd Front
npm install
npm run dev
```

## Важное замечание

Не запускай:

```bash
npm audit fix --force
```

Эта команда может снова поставить несовместимые major-версии зависимостей и вернуть ошибку `ERESOLVE`.

Если нужно проверять безопасность зависимостей, используй:

```bash
npm audit
```

А исправления лучше делать вручную через обновление конкретных пакетов в `package.json`.
