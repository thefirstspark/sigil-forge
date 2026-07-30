# 🎮 PLAYER ONE — Launch Checklist

Everything technical is already built, deployed, and tested. These are the only
moves left, and they're all copy-paste. Total time: ~10 minutes.

---

## MOVE 1 — Create the product on Whop (~5 min)

1. Go to your Whop dashboard → your **Sparkverse** store → **Add product**
2. Name it exactly: **Sigil Forge** *(the word "Sigil" in the name is what tells
   the webhook this purchase is for this app — don't skip it)*
3. Add two pricing options:
   - **$11 / month** (recurring)
   - **$88 / year** (recurring) — optional but recommended
4. Description you can paste:
   > Forge it. Charge it. Release it. Unlimited personalized sigils in three styles,
   > the complete Charging Chamber (six rituals + a bespoke rite for every sigil),
   > your private grimoire, and a new personal sigil every month.
   > Log in at https://sigilcraft.thefirstspark.shop/forge/app.html with your checkout email.
5. Publish it.

✅ If the checkout link ends up being `https://whop.com/sparkverse-511c/sigil-forge/`
you're done. If Whop gives it a different link, tell Claude and it gets updated in
one line.

## MOVE 2 — Point the Whop webhook at the Forge (~2 min)

1. Whop dashboard → **Developer** → **Webhooks** → **Create webhook**
2. Paste this URL:
   ```
   https://qqlodxrzisbwapjcvjoj.supabase.co/functions/v1/sigil-forge-whop
   ```
3. Select events (check all that exist of these):
   - `membership.went_valid` (or `membership.activated`)
   - `membership.went_invalid` (or `membership.deactivated` / `expired`)
   - `payment.succeeded`
4. Save. Copy the **webhook secret** it shows you and paste it to Claude —
   it gets stored server-side so only real Whop events are trusted.
   *(The system works without it, but with it, it's locked.)*

## MOVE 3 — Allow the login link (~1 min)

1. Supabase dashboard → project → **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   ```
   https://sigilcraft.thefirstspark.shop/forge/*
   ```
3. Save.

*(This tells Supabase the magic-link emails are allowed to land on the new app.)*

---

## That's launch. Optional side quests:

- **Custom domain** — want `forge.thefirstspark.shop`? Add a DNS CNAME record
  `forge` → `thefirstspark.github.io` at your registrar, tell Claude, and the
  repo gets a CNAME file + Pages setting. (Also add the new URL in Move 3.)
- **Announce it** — links page, Sparkverse index, Whop store, the usual circuit.
- **First test** — after Move 1–3: buy it yourself with a promo code (make a
  100% off code in Whop), log in at the app, forge, charge, save. Full loop.

## The numbers (from market research, July 2026)

- Free sigil generators exist everywhere → the product is the **practice**, not the generator
- Mystical utility apps cluster at **$4–12/mo**; big astrology brands $12–20/mo
- **$11/mo** sits right at the top of the utility band without competing on brand trust
- **$88/yr** = two months free, under CHANI ($107.99/yr) and Co-Star ($99.99/yr)
- Upsell room later: live rituals / community tier at $19.99–$29.99/mo

## What's already done (no action needed)

- ✅ App live at https://sigilcraft.thefirstspark.shop/forge/ (old thefirstspark.shop/sigil-forge URLs redirect there)
- ✅ Supabase tables + row-level security (grimoires are private per member)
- ✅ Webhook deployed and tested: grants on purchase, revokes on cancel,
  ignores your other Whop products
- ✅ Buy-before-login handled: access waits for the email even if they've never logged in
- ✅ Magic-link login (no passwords), same email as checkout
- ✅ Free taste on the landing page: 3 watermarked sigils/day as the funnel
