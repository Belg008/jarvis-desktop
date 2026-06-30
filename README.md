# JARVIS Desktop

> Din AI-butler — nå som en native desktop-app.

JARVIS Desktop er en Electron-basert app som kobler til din selvhostede JARVIS-server og gir deg en futuristisk, sci-fi-inspirert AI-assistent rett på skrivebordet.

## Features

- 🌐 **Kobler til din JARVIS-server** via Cloudflare-tunnel
- 🎨 **6 aksektfarger** + egendefinert fargevelger
- 📜 **Samtalelogg** med tidsstempel
- ⚙️ **Innstillinger** for server-URL, tema, varsler, hotkeys
- 🛠️ **Kommandobekreftelse** før kjøring på serveren
- 📜 **Systemkurv** (minimer til tray)
- 🌍 **Norsk & Engelsk** språkstøtte

## Tech Stack

- **Electron** — Desktop-app rammeverk
- **React 19** + **Vite** — UI
- **TypeScript** — Type-sikkerhet
- **electron-builder** — Pakking & distribusjon

## Utvikling

```bash
npm install
npm run dev          # Utvikling med hot reload
npm run build        # Produksjonsbygg
npm run dist:win     # Bygg Windows .exe
npm run dist         # Bygg for alle plattformer
```

## Release

Push en tag for automatisk release:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions bygger automatisk `.exe`, `.dmg` og `.AppImage` og legger de til i release.

## Server-oppsett

Appen kobler til `https://jarvis.sindbelg.me` som standard. Du kan endre dette i Innstillinger.

## Lisens

MIT © Sindre Belgum
