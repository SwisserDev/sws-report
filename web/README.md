# SWS Report UI

Next.js (static export) + Tailwind CSS 4 + zustand. FiveM loads the build from `web/out` (`ui_page` in `fxmanifest.lua`).

## Commands

```bash
npm ci                     # install exactly what package-lock.json says
npm run dev                # browser preview on http://localhost:3000
npm run build              # static export to web/out
npm run lint
npm run sync-mock-locales  # copy ../locales/*.lua into the preview after changing translations
```

## Browser preview

Outside FiveM (`window.invokeNative` missing) the UI boots `src/lib/mock/backend.ts`, a fake Lua side with demo reports, chat, notes, inventory and statistics. Every NUI callback is answered, so the whole UI can be clicked through. The mock is loaded through a dynamic import and never runs inside FiveM.

URL parameters for a specific state:

| Parameter | Values |
|-----------|--------|
| `tab` | `my-reports`, `admin`, `statistics` |
| `report` | report id, e.g. `150` |
| `view` | `queue`, `mine`, `resolved` (admin list) |
| `theme` | `dark`, `light` |
| `lang` | `en`, `de`, `fr`, `ja` |
| `scale` | e.g. `1.2`, same as `Config.UI.scale` |

Example: `http://localhost:3000/?tab=admin&report=150&lang=de`

## FiveM's browser is Chrome 103

The game renders the UI with CEF 103. Things that work in a current browser but not there:

- `backdrop-filter`: the game is not part of the page, there is nothing to blur. Use opaque surfaces.
- `color-mix()`, `oklch()`, relative colors: Tailwind opacity modifiers on theme colors (`bg-accent/20`) compile to `color-mix`. Use the explicit tokens from `globals.css` (`bg-accent-soft`, `border-accent-line`, …).
- `translate`, `rotate`, `scale` as standalone properties (Chrome 104+): Tailwind's `translate-*`, `rotate-*`, `scale-*` utilities use them. Use `transform` in CSS or negative margins instead.
- `:has()`, container queries, `dvh`/`svh`, `text-wrap: balance`, CSS nesting in hand-written CSS.
- `navigator.clipboard`: copying uses `document.execCommand("copy")`.

Check a build in a real Chromium 103 before shipping UI changes. Snapshot `1002410` from the Chromium snapshot archive is 103.0.5058.0; `npx @puppeteer/browsers install chromium@1002410` downloads it.

## Layout of the code

```
src/app/                 page shell, global styles and design tokens (globals.css)
src/components/ui/       buttons, inputs, menus, dialogs, status/priority glyphs, icons
src/components/layout/   header, footer, toasts
src/components/report/   report list, detail, chat, notes, player info, inventory
src/components/stats/    statistics view and its charts (plain SVG)
src/hooks/               NUI listener and actions, escape handling, resize helpers
src/lib/                 NUI bridge, time formatting, report helpers, browser mock
src/stores/              zustand store
```

## Sizing

The root font size follows the game resolution (16px at 1080p, 21px at 1440p, 32px at 4K) and is multiplied by `Config.UI.scale`. Everything is sized in `rem`, so use rem values (`w-[23.5rem]`) instead of pixels.
