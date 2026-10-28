# Kindlewake

Browser party RPG, turn-based with timed hits, roguelike runs, phone landscape first. TypeScript + Vite + Vitest, no
framework. Spec: `docs/superpowers/specs/2026-10-28-kindlewake-design.md`.

## Spoiler policy (hard rule)

The owner plays the game blind. Never put names of places, characters, enemies, plot, twists or late content in chat, commit
messages, the README, code comments outside `src/data`, or this file. All of that goes in `docs/SPOILERS-*.md` only. Chat
updates describe mechanics and progress ("act 1 boss tuned", "12 events written"), never content.

## Layout

- `src/core` rng/types, `src/data` content tables, `src/engine` pure game logic (no DOM), `src/ui` canvas scenes + DOM
  sheets, `tests` vitest (`SIM=1` enables the long bot sims), `tools` build scripts, `public` atlases and audio.
- Assets: CC0/CC-BY only, every pack listed in `docs/CREDITS.md`. No ROM rips, no commercial packs.

## Commands

- `npm run dev` (Vite on 5175), `npm test` (fast tests), `SIM=1 npx vitest run sim` (balance sim), `npm run build`.
- Deploy: push to `main` runs tests + build and publishes to GitHub Pages.

## Conventions

- Engine functions are pure and deterministic given the seed; the UI resolves timing windows and passes grades in.
- Keep files focused; content tables in `src/data` are plain objects, one file per kind.
- Commit messages: imperative, spoiler-free.
