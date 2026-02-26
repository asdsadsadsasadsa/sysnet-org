# Etsy Execution Sprint (Autonomous)

## Objective
Launch first 60 experiments fast, then run 72-hour kill/iterate/scale loop.

## Current defaults
- Niches: Dog Moms, Teachers, Nurses
- Events: Mothers Day, Fathers Day, Graduation
- Products: T-Shirt, Mug, Sticker
- Initial batch: 60 experiments (`experiments.csv`)

## Daily execution loop
1. Build/publish 20 listings/day
2. Track metrics in `experiments.csv`
3. At 72h: kill bottom 50%, iterate middle 30%, scale top 20%
4. Clone winners into adjacent variants

## Kill/Scale heuristics (v1)
- Kill: high impressions but very low clicks/orders after 72h
- Iterate: moderate clicks, low conversion (change mockup/title/price)
- Scale: positive profit and best conversion in cohort

## Blockers that require owner
- Etsy account verification, OTP/CAPTCHA
- Bank/tax/payment details
- Browser relay attach for guided setup
