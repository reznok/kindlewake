# Kindlewake

A bright, turn-based party RPG for the browser: timed hits, a party of six, a run that ends when they all fall, and a
Ledger that remembers. Phone landscape first; works on desktop with keyboard and mouse.

Play: https://reznok.github.io/kindlewake/

## Develop

```
npm install
npm run dev        # http://localhost:5175/
npm test           # unit tests
SIM=1 npx vitest run sim   # long balance simulation
npm run build
```

Pushing to `main` deploys to GitHub Pages. Art and audio credits: `docs/CREDITS.md`.
