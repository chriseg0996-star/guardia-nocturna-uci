# Guardia Nocturna en UCI

Juego de mesa digital para móvil, estilo Monopoly, temático de Medicina Crítica. Hot-seat (2–4 jugadores en un mismo dispositivo). Instalable como PWA, funciona offline.

## Stack

- Vite + React + TypeScript (strict)
- Zustand (estado + persistencia localStorage)
- Framer Motion (animaciones)
- CSS variables (design system SONOCRÍTICO) + CSS Modules
- vite-plugin-pwa
- Vitest (tests del engine)

## Desarrollo

```bash
npm install
npm run dev
```

Abre la URL local en el móvil (misma red) o usa las DevTools en modo portrait.

## Build y preview

```bash
npm run build
npm run preview
```

## Deploy a GitHub Pages

El `base` por defecto es `/guardia-nocturna-uci/` (repo name). Para otro path:

```bash
# Windows PowerShell
$env:VITE_BASE_PATH="/"; npm run build

# Linux/macOS
VITE_BASE_PATH=/ npm run build
```

Sube el contenido de `dist/` a GitHub Pages (branch `gh-pages` o Actions).

## Tests

```bash
npm test
```

## Cómo agregar preguntas

Edita `src/data/questions.ts`. Cada categoría (1–8) tiene un array de cartas:

```ts
{
  q: 'Enunciado de la pregunta',
  a: 'Respuesta / explicación',
  options: ['A', 'B', 'C', 'D'],  // opcional — activa modo auto-calificado
  correct: 2,                       // índice 0-based de la opción correcta
}
```

- **Con `options` + `correct`**: el jugador elige y el juego califica automáticamente (recomendado en móvil).
- **Sin options**: modo “revelar respuesta”; los jugadores juzgan con Correcto/Falló.

Categorías **2–5** están marcadas `[PENDIENTE]` con placeholders; el juego funciona igual.

Eventos de casilla estrella: `src/data/events.ts`.

Categorías (colores/íconos): `src/data/categories.ts`.

## Reglas (decisiones v1)

| Casilla | Efecto |
|---------|--------|
| Pase de visita (GO) | +1 vida al completar vuelta (máx. 10) |
| Código Azul | Pierdes el turno (no resuelves casilla) |
| Categoría | Pregunta MC o revelar; acierto = sello, fallo = −1 vida |
| Estrella | Carta de evento |

Victoria (configurable en settings, P3): UCI Master (8 sellos) y/o supervivencia (último con vidas).

## Estructura

```
src/
  game/       engine.ts, store.ts, board.ts
  components/ Splash, Setup, …
  data/       categories, questions, events
  styles/     tokens.css, globals.css
```

## Fases

- **P0** ✓ Scaffold, PWA, tokens, Setup
- **P1** ✓ Tablero perimetral, dado, fichas animadas, detección de vuelta
- **P3** Victoria, settings, persistencia completa
- **P4** Pulido móvil, haptics, sonido, deploy

## Licencia

Proyecto educativo — SONOCRÍTICO / Medicina Crítica.
