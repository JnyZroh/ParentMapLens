# Anywhere Parent — Polish To-Do

## UI
- [ ] Choose a better color scheme

## Functionality
- [ ] Figure out how to prompt and incentivize users to submit reviews and add photos — explore options like post-visit prompts, contribution badges, or gamification so data stays fresh and crowdsourced.

## Feature
- [ ] Add 'close matches' grid with 2 nearby suggestions below the empty state section that reads "No nearby venues match your filters"
- [ ] Implement sign-up and sign-in pages. Also explore whether cookies / localStorage are enough to persist a user's crew composition without an account, or whether a lightweight anonymous session is needed.
- [x] `confirmed` is currently a per-place boolean, but longer-term it may need to be per-tag — a venue could have a verified stroller ramp but an unconfirmed changing table. Decide whether this granularity is needed before Phase 5 (Parent Report form) is designed, since that feature will be the mechanism that drives confirmations.
  > **Resolved:** Moved to per-tag confirmation. Each tag stores `confirmed_at` (datetime) and `confirmed_by` (user_id), both nullable. Three states derived at query time: `unconfirmed`, `confirmed` (< 12 months), `stale` (> 12 months). The Parent Report form (Phase 5.5) must confirm individual tags, not the whole venue. See `data.md` for the full model.
