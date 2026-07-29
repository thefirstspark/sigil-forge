# ⚡ Sigil Forge

> Forge it. Charge it. Release it.

A standalone subscription app of the Sparkverse. Members forge personalized,
deterministic sigils from their intentions, learn six charging rituals (plus a
bespoke rite generated per sigil), keep a private grimoire, and receive a new
personal sigil every month.

**Pricing:** $11/month · $88/year (via Whop)

## Stack

- Pure HTML / CSS / vanilla JS — no build step, GitHub Pages hosting
- **Supabase** — magic-link auth, `sf_profiles` / `sf_sigils` / `sf_grants` tables (RLS-protected)
- **Whop** — payments; a webhook (`sigil-forge-whop` edge function) grants/revokes access by email
- Sigil engine shared DNA with [sigilcraft](https://github.com/thefirstspark/sigilcraft)

## How access works

1. Customer subscribes on Whop.
2. Whop fires a webhook → Supabase edge function `sigil-forge-whop`.
3. The function records the grant by email (`sf_grants`) and syncs any existing profile.
4. Customer logs into `app.html` with a magic link using the same email → access.
5. Cancellation fires the same webhook → access revoked. Grimoire data is kept.

## Files

| File | Purpose |
|---|---|
| `index.html` | Landing / sales page with free taste forge (3/day, watermarked) |
| `app.html` | Member app: Forge · Charge · Grimoire · Monthly |
| `js/sigil-engine.js` | Deterministic sigil engine (3 styles) + charging rituals |
| `js/config.js` | Supabase + Whop configuration |
| `css/forge.css` | Shared styling (TFS visual DNA) |
| `PLAYER-ONE.md` | Launch checklist |

---

*Reality is programmable. Consciousness is the code.*
