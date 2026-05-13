# Procedural World — Agent Context

## Project Overview

A top-down 2D game with procedurally generated terrain, built for exploration. The world uses simplex noise to generate elevation maps mapped to terrain tiles (deep water → snow cap). Chunk-based loading/unloading enables an effectively infinite world.

Long-term vision: biomes, structures (trees, rocks, buildings), multiplayer via Go WebSocket server, player persistence via PostgreSQL.

## Architecture

```
procedural-world/
├── client/                          # Phaser.js + TypeScript + Vite
│   └── src/
│       ├── main.ts                  # Entry point, Phaser game config
│       ├── scenes/
│       │   ├── BootScene.ts         # Asset loading splash
│       │   └── GameScene.ts         # Main gameplay loop
│       ├── world/
│       │   ├── TerrainGenerator.ts  # Simplex noise → elevation → TileType
│       │   ├── ChunkManager.ts      # Chunk load/unload around player
│       │   └── TileMap.ts           # Chunk data structures
│       ├── entities/
│       │   └── Player.ts            # WASD + arrow movement, camera follow
│       ├── network/
│       │   └── WebSocketClient.ts   # Stub for future multiplayer
│       └── config/
│           └── constants.ts         # All tunable constants
├── server/                          # Go backend
│   ├── cmd/server/main.go           # HTTP server, health check, WS route
│   ├── internal/
│   │   ├── handler/ws.go            # WebSocket handler (echo stub)
│   │   ├── world/generator.go       # Server-side terrain seed/types
│   │   └── model/player.go          # Player struct
│   ├── go.mod
│   └── Dockerfile                   # Multi-stage build
├── docker-compose.yml               # Go server + PostgreSQL
├── schema.sql                       # Players table
└── AGENTS.md                        # This file
```

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Phaser 3.80 + TypeScript 5.4 | 2D game engine, tilemap rendering, input, camera |
| Build | Vite 5 | Dev server (HMR), bundling |
| Noise | simplex-noise 4 | 2D/3D simplex noise for terrain generation |
| Backend | Go 1.22 | HTTP server, WebSocket, authoritative game state |
| WS | gorilla/websocket | Real-time bidirectional communication |
| Database | PostgreSQL 16 | Player persistence, world seeds |
| Infra | docker-compose | Local dev environment |

## Current Status

**Phase 1 — Scaffolding + Basic Terrain** ✅ Complete

- Project structure created
- Client renders colored-tile terrain from simplex noise (3 octaves)
- Chunk system (16x16 tiles, 32px each) with view radius 3
- Player movement (WASD + arrows, diagonal normalization)
- Camera follows player, chunks load/unload dynamically
- Go server with health check and WebSocket echo handler
- Docker Compose with PostgreSQL
- Database schema for players

**Phase 2 — Enhanced Terrain** ✅ Complete

- Secondary noise layer for humidity/temperature → biomes (9 biomes)
- Structure objects placed (trees, pine, rocks, bushes) based on biome/elevation
- Smooth terrain rendering with sub-tile color interpolation
- Minimap with player position marker and viewport indicator
- Character sprite system with 4 characters (Adventurer, Hooded, Knight, Wanderer)
- Walking animation (4 directions × 4 frames)
- Character selection screen
- Responsive fullscreen canvas with window resize handling
- Camera zoom controls (0.5x - 5x)

> **⚠️ Agent Maintenance:** When developing or marking features complete, always update this AGENTS.md file to reflect the current state. Keep the "Current Status" section accurate and move completed phases/items to the done state.

## Setup & Development

```bash
# Client (dev mode)
cd client && npm install && npm run dev

# Server (native)
cd server && go mod tidy && go run ./cmd/server

# Full stack (Docker)
docker compose up --build
```

## Coding Conventions

### TypeScript
- Strict mode enabled
- No `any` unless unavoidable
- Enums for fixed sets (TileType)
- Phaser types via `import Phaser from 'phaser'`

### Go
- Standard library where possible
- Internal packages for encapsulation
- JSON tags on all exported struct fields

## Known Patterns

### Terrain Generation
- 3 octaves of 2D simplex noise (scales: 0.004, 0.015, 0.040)
- Weights: 0.6 / 0.3 / 0.1 for detail levels
- Elevation → tile type via thresholds:
  - 0.00–0.45: Deep water (#1a3a5c) — vast oceans (~45% of world)
  - 0.45–0.53: Shallow water (#2a6a9c) — continental shelf
  - 0.53–0.59: Sand (#d4b87a) — wide beaches
  - 0.59–0.70: Grass (#4a8c3f) — plains
  - 0.70–0.83: Forest (#2d5a27) — further inland
  - 0.83–0.92: Stone (#7a7a7a) — mountain transitions
  - 0.92–1.00: Snow (#e8e8f0) — high peaks

### Chunk System
- Chunk size: 32×32 tiles (1024×1024 px)
- View radius: 3 chunks (7×7 = 49 chunks loaded at a time)
- Tile size: 32×32 px
- Chunks rendered as Phaser `Graphics` (colored filled rects)
- Only re-evaluated when player crosses chunk boundary

### Player
- Red 16×16 rectangle at depth 10
- Speed: 200 px/s (diagonals normalized)
- Camera: smooth follow (lerp 0.1), bounds at ±100k px

## What's Next (Planned Phases)

### Phase 3 — Interaction & Gameplay
- [ ] Tile interaction (click to inspect, gather resources)
- [ ] Day/night cycle
- [ ] Inventory system
- [ ] Basic crafting

### Phase 4 — Multiplayer
- [ ] Go server sends world seed on WS connect
- [ ] Player position broadcasting (WebSocket)
- [ ] Authoritative server-side validation
- [ ] PostgreSQL persistence for player state

### Phase 5 — Polish
- [ ] Replace colored rectangles with tileset sprites
- [ ] Particle effects (footsteps, water ripples)
- [ ] Sound system
- [ ] UI overlay (health, position, compass)

## Key Constants

| Constant | Value | Description |
|---|---|---|
| TILE_SIZE | 32 | Pixels per tile |
| CHUNK_SIZE | 32 | Tiles per chunk axis |
| CHUNK_PIXELS | 1024 | Pixels per chunk axis |
| VIEW_RADIUS | 3 | Chunks to load in each direction |
| PLAYER_SPEED | 200 | Pixels per second |
| GAME_WIDTH | 800 | Canvas width |
| GAME_HEIGHT | 600 | Canvas height |
| SEED | 42 | World generation seed |
