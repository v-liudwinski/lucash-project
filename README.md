# Книжкові мапи

Інтерактивні мапи сюжетів прочитаних книжок. Перша — «Премудрий гідальго Дон Кіхот з Ламанчі» (переклад Миколи Лукаша та Анатоля Перепаді).

## Запуск

```
npm install
npm run dev      # http://localhost:5173
npm run build    # збірка в dist/
```

## Хостинг

Cloudflare Pages, підключений до GitHub: кожен push у `main` автоматично деплоїть сайт.
Налаштування збірки: команда `npm run build`, тека `dist`. Версію Node задає `.node-version`.
Глибокі посилання (`/knyha/...`) працюють завдяки SPA-режиму Pages (у `dist` немає `404.html`).

## Стек

React 19 + TypeScript + Vite, react-router, Leaflet (react-leaflet), шрифти Cormorant Garamond і Lora.
Тайли мапи — Esri World Shaded Relief (без ключа API), стилізовані CSS-фільтром під стару мапу.

## Як додати книжку

1. Створити `src/data/<книжка>.ts` з об'єктом типу `Book` (див. `src/types.ts`): місця з координатами, маршрути, персонажі, епізоди.
2. Додати її до масиву в `src/data/books.ts`.

Місця, які автор не називає, позначаються `approximate: true` — на мапі вони підписані як «умовні».
