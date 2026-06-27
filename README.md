# terms.spirzen.ru — глоссарий «Вселенная IT»

Astro-сайт глоссария (~4250 терминов). URL: `/glossary/{буква}#{термин}`.

| | |
|---|---|
| Прод | [terms.spirzen.ru](https://terms.spirzen.ru) |
| Локально | http://localhost:4330 |
| Контент | `content/glossary/` |
| Источник sync | `it-knowledge-base/docs/glossary` |

## Команды

```bash
npm install
npm run sync:glossary   # IT_KB_ROOT=../it-knowledge-base
npm run dev
npm run build
```

## Экосистема

Один repo = один домен (GitHub Pages). Соседние порталы: `it-lab`, `it-games`, `it-kids`, `it-tools`.  
Общий конфиг URL: `ecosystem-urls.json` (синхронизировать при изменении nav).

**it-portals** — хаб экосистемы на [status.spirzen.ru](https://status.spirzen.ru), не контентный портал.

## Деплой

GitHub Pages + CNAME `terms.spirzen.ru`. Workflow: `.github/workflows/deploy.yml`.
