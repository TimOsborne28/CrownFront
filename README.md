<p align="center">
  <img src="resources/images/CrownFrontLogo.svg" alt="CrownFront" width="420">
</p>

**CrownFront** is an unofficial, modified medieval edition of OpenFront. It is not endorsed by or affiliated with OpenFront Inc. This is the actual OpenFront game, not a mockup: the deterministic simulation, controls, wire protocol, multiplayer turn relay, economy, diplomacy, bots, victory conditions and weapon rules remain intact.

An original crown-and-shield identity, wood-and-iron war table, parchment cartography, medieval unit artwork and English terminology replace the modern presentation. Terrain and coastlines remain playable map data, not a decorative background.

**© OpenFront and Contributors**

This is a fork/rewrite of WarFront.io. Credit to https://github.com/WarFrontIO.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Assets: CC BY-SA 4.0](https://img.shields.io/badge/Assets-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

## License

OpenFront source code is licensed under the **GNU Affero General Public License v3.0**

Current copyright notices appear in:

- Footer: "© OpenFront and Contributors"
- Loading screen: "© OpenFront and Contributors"

Modified versions must preserve these notices in reasonably visible locations.

See the [LICENSE](LICENSE) for complete requirements.

For asset licensing, see [LICENSE-ASSETS](LICENSE-ASSETS).  
For license history, see [LICENSING.md](LICENSING.md).

### CrownFront modifications and corresponding source

CrownFront changes are dated September 2026. The code remains AGPL-3.0 with the upstream additional attribution terms. Original CrownFront SVG artwork and synthesized audio are offered under CC BY-SA 4.0; credit **CrownFront contributors** for these additions and **OpenFront and Contributors** for retained open assets. Map-data and other third-party notices remain in [CREDITS.md](CREDITS.md).

The development server's **[Modified source download](http://localhost:9000/source)** packages this working tree's current code, open resources, build inputs, tests and license notices. Production builds also emit `static/source.tar.gz`, served by the game server at `/source`. This is the modified source, not a misleading link to upstream. When distributing or network-hosting a modified build, provide its complete corresponding source and keep the visible attribution and source access intact. Rebuild the source archive when changing a deployed build.

`proprietary/` is upstream restricted material: CrownFront does not load, copy, bundle or include it in its source download or Docker build. Neither premium/CDN assets nor official music are used. Do not distribute the original checkout's `proprietary/` folder with this derivative. Generated original audio can be reproduced with `node scripts/generateCrownFrontAudio.mjs`.

### Medieval names, unchanged rules

| Original role                    | CrownFront presentation                   |
| -------------------------------- | ----------------------------------------- |
| City / Defense Post              | Keep / Watchtower                         |
| Port / Factory                   | Harbor / Foundry                          |
| Missile Silo / SAM Launcher      | Siege Workshop / Ballista Tower           |
| Transport / Warship / Trade Ship | Troop Galley / War Galley / Merchant Cog  |
| Train / Railroad                 | Caravan / King's Road                     |
| Atom Bomb / Hydrogen Bomb / MIRV | Wildfire Pot / Dragonfire / Plague Volley |
| Plutonium                        | Sulfur                                    |

These are visual and terminology changes, not historical balance changes: blast areas, interception, cooldowns, range, prices and damage retain OpenFront's rules. Advanced siege weapons still have their original devastating effects.

CrownFront defaults to English. Other languages remain selectable for existing controls; the medieval terminology and rewritten guidance retain English text until translated specifically for this edition. Original artwork can be regenerated with `node scripts/generate-crownfront-art.mjs`.

## 🌟 Features

- **Real-time Strategy Gameplay**: Expand your territory and engage in strategic battles
- **Alliance System**: Form alliances with other players for mutual defense
- **Multiple Maps**: Play across various geographical regions including Europe, Asia, Africa, and more
- **Resource Management**: Balance your expansion with defensive capabilities
- **Cross-platform**: Play in any modern web browser

## 📋 Prerequisites

- Node.js 24 and [npm](https://www.npmjs.com/) (v10.9.2 or higher)
- A modern web browser (Chrome, Firefox, Edge, etc.)

## 🚀 Installation

1. **Use this modified CrownFront checkout**, or extract its corresponding-source download. The official upstream repository does not contain CrownFront's modifications.

2. **Install dependencies**

   ```bash
   npm run inst
   ```

   Do NOT use `npm install` nor `npm i` but instead use our `npm run inst`. It runs the safer `npm ci --ignore-scripts` to install dependencies exactly according to the versions in `package-lock.json` and doesn't run scripts. This can prevent being hit by a supply chain attack.

## 🎮 Running the Game

### Development Mode

Run both the client and the existing local guest game server:

```bash
npm run dev
```

This will:

- Serve CrownFront at **http://localhost:9000** using Vite.
- Launch the local coordinator on port 3000 and game workers on 3001/3002.
- Open your browser (set `SKIP_BROWSER_OPEN=true` to suppress this).

Choose **Solo** for a real bot match, pick a map, start, and click land to choose your spawn. Left-click outside your territory to expand or attack; right-click for diplomacy/building actions. Mouse wheel/pinch zoom and drag/WASD panning work as before. The Field Manual and settings list the unchanged controls and configurable hotkeys.

For multiplayer, use **Host** and share the lobby link with another local browser/player; **Join** accepts the lobby code. `npm run dev:host` exposes Vite on your LAN so other devices can open `http://YOUR-LAN-IP:9000`. Keep this guest development server on trusted networks; it is not a production authentication deployment.

No API key or official account is required. CrownFront intentionally does not offer official accounts, purchases, cloud archives, ranked matchmaking or promotional embeds: those depend on the closed-source production API, not the open game simulation. Local solo, bots, hosted/public local matches and the complete gameplay systems remain available. The client ignores saved production API overrides and uses same-origin open assets.

### Client Only

To run just the client with hot reloading:

```bash
npm run start:client
```

### Server Only

To run just the server with development settings:

```bash
npm run start:server-dev
```

### Local-only service configuration

Use the provided development scripts, with `GAME_ENV=dev`, `DOMAIN=localhost` and the default localhost cluster. Leave `CDN_BASE`, `API_DOMAIN`, `SITE_HOST`, telemetry destinations and production cluster overrides unset. Do not point this derivative at OpenFront's production or staging services. The old upstream `dev:prod` and `dev:staging` shortcuts have been removed.

## 🛠️ Development Tools

- **Format code**:

  ```bash
  npm run format
  ```

- **Lint code with Oxlint and ESLint**:

  ```bash
  npm run lint
  ```

- **Lint and fix code with Oxlint and ESLint**:

  ```bash
  npm run lint:fix
  ```

- **Testing**
  ```bash
  npm test
  ```

## 🏗️ Project Structure

- `/src/client` - Frontend game client
- `/src/core` - Deterministic game simulation
- `/src/server` - Backend game server
- `/resources` - Static assets (images, maps, etc.)
- `/zbin` - Compact binary wire format for zod schemas (self-contained, zod-only)

## 🤝 Contributing

Contributions and translations are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow, the approved-issue process, project governance, and translation info.
