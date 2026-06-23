# Tag Logic Reference — Manual Review Guide

Use this file when reviewing `tagged_venues.json`. For each tag you find on a venue, this document explains the rule that was applied, gives a concrete example, and tells you when to keep, change, or remove it.

---

## How to read this file

Each category states its **combination rule** up front — how many tags from that category a venue can hold at once. Within a category, each tag entry has three parts:

- **Rule applied** — the signal or condition that triggers this tag
- **Example** — a real or hypothetical Verdun venue showing why it was chosen
- **Review guidance** — when to keep it, change it, or swap it

---

## SPACE
**Combination rule: up to 4 tags can coexist.** All space tags are independent. Exception: `stroller_friendly` and `tight_space` describe opposite conditions for the *same physical area* — they should not appear together. However, a venue can have `tight_space` (cramped indoor) AND `outdoor_seating` (open terrace), since those describe different areas.

`no_indoor_seating` makes `tight_space` redundant — if there is no indoor space at all, there is nothing to be tight.

---

### `stroller_friendly`
**Rule applied:** Assigned to parks, large open-plan casual venues, and venues where the name or category implies wide circulation space.

**Example:** *Parc Arthur-Therrien* — a large waterfront park with paved paths. A double stroller navigates it easily. Tag applied automatically to all parks with paved or open terrain signals.

**Review guidance:**
- Keep if the venue has wide aisles, step-free entry, and room to park or manoeuvre a stroller near the table.
- Remove if the venue is on a second floor, has a narrow door, or tables are packed together even if it is large.
- Cafés and restaurants rarely get this unless they are unusually spacious — scrutinise it on any indoor venue.

---

### `tight_space`
**Rule applied:** Assigned to small specialty cafés, boutique shops, take-out counters, and grab-and-go spots where the category and review count suggest a compact footprint.

**Example:** *BOSSA Prêt à manger* — a popular grab-and-go with 2,463 reviews suggests high volume in a small space. A stroller would block the aisle at peak hours.

**Review guidance:**
- Keep if you would hesitate to enter with a double stroller even at a quiet hour.
- Remove if the venue is larger than the name or category implies — some "prêt à manger" spots have generous seating areas.
- Add it manually if a venue feels cramped from personal experience even if the LLM did not flag it.

---

### `outdoor_seating`
**Rule applied:** Assigned when the venue name contains "Patio," "Jardin," "Beach," or "Promenade"; when it is a park (all parks have outdoor space by definition); or when local knowledge strongly implies a terrace.

**Example:** *Le Patio* — the name alone is the signal. *Janine Café-Brunch* — a well-known Wellington brunch spot with a recognisable terrace.

**Review guidance:**
- Keep if there is a terrace, patio, or tables on the sidewalk at least in summer.
- Remove if what appears to be a patio from the name is actually an interior courtyard with no stroller access.
- Add it manually to any venue you know has a terrace that the LLM did not catch.

---

### `no_indoor_seating` *(human-entry only — never LLM-suggested)*
**Rule applied:** Not applied by the LLM. Added during manual review only.

**Example:** A take-out window crêpe stand on Wellington with no chairs inside. A food truck. A counter-only café with two stools.

**Review guidance:**
- Add this only if you personally know the venue has nowhere to sit indoors.
- Do not infer it from low review counts or low price — a new café with 10 reviews may simply be new.
- If `no_indoor_seating` is present, `tight_space` is redundant and should be removed.

---

## NOISE
**Combination rule: exactly 1 tag.** These are mutually exclusive. Every café and restaurant must have one. Parks do not get noise tags.

---

### `noise_low`
**Rule applied:** Assigned to tea houses, specialty coffee roasters, quiet bistros, and coworking spaces where a calm atmosphere is core to the venue identity.

**Example:** *Maison de thé Cha Noir* — a tea house by definition cultivates a quiet, unhurried environment. *Balance Torrefacteur* — a specialty roaster with a 4.9 rating and no price level suggests a focused, intentional café experience rather than a loud communal space.

**Review guidance:**
- Keep if you could hold a conversation in a normal voice at peak hours without raising it.
- Change to `noise_moderate` if the venue gets loud at brunch or weekend rush, even if it is calm on a Tuesday afternoon.
- Archway (small vegan café) received `noise_low` based on its café classification and high rating. If it is lively at lunch, `noise_moderate` is more accurate.

---

### `noise_moderate`
**Rule applied:** Default for most cafés and casual restaurants where no strong signal pushes toward quiet or loud.

**Example:** *Namaste Inde* — a well-rated Indian restaurant on Wellington. Busy but not a pub; quiet enough for conversation but not library-silent.

**Review guidance:**
- This is the safe default. Keep it when you are unsure.
- Upgrade to `noise_high` if the venue feels like a dining room that competes with itself — sports on TV, open kitchen, large tables of groups.
- Downgrade to `noise_low` only if the venue is genuinely calm and you would feel comfortable with a sleeping infant in a car seat.

---

### `noise_high`
**Rule applied:** Assigned to fast food chains, pubs, brasseries with "pub" in the name, casse-croûtes, and any venue where a loud, casual, high-turnover atmosphere is the expected experience.

**Example:** *BENELUX - Brasserie Artisanale / Pub Wellington* — "Pub" is in the name. *KFC*, *McDonald's*, *Casse-Croûte Normand* — high-volume, hard surfaces, no acoustic dampening.

**Review guidance:**
- Keep if a fussy baby would blend in or the ambient noise level would mask normal toddler sounds.
- This is actually a *useful* tag for some parents — a noisy venue means a crying baby is less disruptive. Do not treat it as purely negative.
- Remove if the venue has quietened down (e.g. a pub that removed its live music) or if your personal experience contradicts the expectation.

---

## NEEDS
**Combination rule: all 5 tags are independent and can coexist.** A venue can have all five or none. Only suggest these when there is a real signal — do not guess.

---

### `changing_table`
**Rule applied:** Assigned to venues where the category or brand makes it highly likely: McDonald's, Tim Hortons, and large family-oriented chains typically have changing tables in all locations.

**Example:** *McDonald's* — Canadian McDonald's locations are required by policy to have changing facilities. *Tim Hortons* — same reasoning for a major chain.

**Review guidance:**
- Keep only if you have personally seen a changing table or the chain's policy is known.
- Remove if the venue is a small independent restaurant where this was inferred rather than known.
- This is one of the highest-value tags for parents of infants — a false positive here is worse than a false negative.

---

### `high_chairs`
**Rule applied:** Assigned to family-friendly chains (McDonald's, St-Hubert, Tim Hortons, KFC), brunch spots, and classic neighbourhood restaurants where families are a core demographic.

**Example:** *Chez Jacquie et France* — a budget, very popular neighbourhood diner with 1,464 reviews. Venues like this in Verdun almost always keep a few high chairs by the host stand.

**Review guidance:**
- Keep if you have seen high chairs or the venue clearly targets families.
- Remove if the venue is primarily adult-focused or has only bar/counter seating.
- Add it manually to any venue you know keeps high chairs even if the LLM did not flag it.

---

### `kids_menu`
**Rule applied:** Assigned to chain restaurants with known kids menus (McDonald's, KFC, St-Hubert, Subway, Domino's) and to crêpe cafés where kids options are implied by the food type.

**Example:** *St-Hubert Express* — St-Hubert is a Québec institution known for its family offering including a dedicated kids menu.

**Review guidance:**
- Keep for any chain you know offers a kids meal.
- Add manually for independent restaurants you know offer children's portions or a dedicated kids section.
- Remove if the venue is a specialty restaurant (Indian, sushi, Persian) where kids options are not standard — the LLM should not have added this, but double-check.

---

### `play_area`
**Rule applied:** Assigned to venues where the name, category, or brand explicitly implies a play feature: McDonald's (PlayPlace), board game restaurants, toy store cafés, and explicitly named kid zones.

**Example:** *Joker Resto Ludique* — "Ludique" means playful/game-based. This is a board game restaurant where the play element is the core concept. *Lili et Oli Verdun* — a toy store with a café component; children play while parents eat.

**Review guidance:**
- Keep only if there is a dedicated physical play area or game/activity component inside the venue.
- Remove if McDonald's at this specific location does not have a PlayPlace (not all do).
- Add manually for any venue you know has a play corner, activity table, or similar.

---

### `unisex_baby_duty`
**Rule applied:** Not assigned by the LLM in this pass — no venue in this dataset had a strong enough metadata signal. This tag requires in-person knowledge.

**Example:** A café that has a single unisex family washroom with a fold-down change table, accessible to any caregiver regardless of gender.

**Review guidance:**
- Add this manually during Step 3 if you know a specific venue has gender-neutral changing/nursing facilities.
- Do not infer it from the presence of `changing_table` alone — many changing tables are only in the women's washroom.

---

## VIBE
**Combination rule: 1 tag in most cases; 2 tags allowed when a venue genuinely serves two audiences at different times.**

The three `kid_welcoming` levels are mutually exclusive with each other — a venue gets exactly one level. `adult_focused` is also its own tag. However, `kid_welcoming_low` + `adult_focused` is a valid combination for a venue that tolerates children at lunch but becomes an adults-only environment in the evening. `kid_welcoming_medium` or `kid_welcoming_high` combined with `adult_focused` would be contradictory and should not appear together.

---

### `kid_welcoming_low`
**Rule applied:** Floor-level default assigned to any café or restaurant that is not actively adult-focused and has at least a neutral attitude toward children. Applied when no strong positive or negative signal exists.

**Example:** *Archway* (small vegan café, Wellington) — no kids menu, no high chairs in the metadata, but nothing actively excludes families. A parent with a calm toddler could eat here without issue.

**Review guidance:**
- Keep for the majority of casual cafés and restaurants where children are tolerated but not specifically catered to.
- Upgrade to `kid_welcoming_medium` if you add two or more Needs tags (high chairs + kids menu, for example) or if the venue is known for being warm toward families.
- Downgrade to `adult_focused` if the venue skews strongly adult in atmosphere even without being a bar.

---

### `kid_welcoming_medium`
**Rule applied:** Assigned when multiple clear family signals are present in combination: a known kids menu AND high chairs; a board game or play theme; a toy store café; or a major family chain (St-Hubert, McDonald's).

**Example:** *Janine Café-Brunch* — a very popular brunch spot (2,294 reviews, 4.7 rating) with known outdoor seating and a brunch format that commonly includes high chairs and family groups. *Lili et Oli Verdun* — a toy store café where the entire concept is family-oriented.

**Review guidance:**
- Keep if the venue actively accommodates families with physical amenities (high chairs, change table, kids menu) or has a family-first atmosphere.
- Downgrade to `kid_welcoming_low` if on reflection the venue is just neutral rather than actively welcoming.
- Do not upgrade to `kid_welcoming_high` — that tag requires confirmed welcoming staff, which only a parent report or your personal observation can establish.

---

### `kid_welcoming_high` *(human-entry only — never LLM-suggested)*
**Rule applied:** Not applied by the LLM. Requires confirmed welcoming staff attitude from a parent report or personal visit.

**Example:** A café where the staff brings out a small snack for your toddler without being asked, or where the owner visibly enjoys having children in the space.

**Review guidance:**
- Add this manually only if you have first-hand knowledge that staff go out of their way for families.
- `kid_welcoming_medium` + welcoming staff observed in person = upgrade to `kid_welcoming_high`.

---

### `adult_focused`
**Rule applied:** Assigned to pubs (name contains "Pub," "Bar," or "Brasserie" in a pub sense), cocktail lounges, coworking spaces, and venues with price_level 3–4 where fine dining is implied.

**Example:** *BENELUX - Brasserie Artisanale / Pub Wellington* — "Pub" is explicit. *Workden - Verdun Coworking Space* — a quiet professional environment where a toddler would be disruptive by definition. *Chez BOSS & Fils* — price level 3, upscale positioning.

**Dual-tag example:** A restaurant that serves families at lunch but transforms into a wine bar with DJs on Friday evenings could carry both `kid_welcoming_low` + `adult_focused`. The combination signals to parents: "fine for a weekday lunch, not for a Friday dinner."

**Review guidance:**
- Keep for any venue where a parent would feel out of place or unwelcome bringing young children during normal evening hours.
- Remember this tag is crew-sensitive in the score engine — a quiet newborn gets a lighter penalty than an active toddler at the same `adult_focused` venue.
- Add `kid_welcoming_low` alongside it only if the venue genuinely has a daytime or early-evening window when families are appropriate.

---

## PARKS ONLY
**Combination rule: multiple tags can coexist.** A park can have all three. These tags are only valid for `place_type: park`.

---

### `playground`
**Rule applied:** Default for most neighbourhood parks and school parks ("parc-école"). Assigned based on Google Maps category, address (school parks always have equipment), and review count suggesting active use.

**Example:** *Parc Willibrord* — a known Verdun neighbourhood park with 195 reviews and a 4.4 rating. Review counts this high for a local park almost always mean there is playground equipment drawing regular visitors.

**Review guidance:**
- Keep for any park you know has a play structure.
- Remove for linear parks, promenades, and dog parks where the draw is open space or walking paths rather than equipment.
- The dog parks (*Parc à chien Dupuis*, *Parc à chiens de Verdun*) did not receive `playground` — that is intentional.

---

### `splash_pad`
**Rule applied:** Assigned only to parks known to have water play features: Parc Arthur-Therrien, Parc Monseigneur-J.-A.-Richard, Parc Willibrord, and Verdun Beach.

**Example:** *Parc Arthur-Therrien* — a large waterfront park along the St. Lawrence with known splash pad infrastructure.

**Review guidance:**
- This is a high-value tag in Montréal summers. Verify it is still operational — splash pads sometimes close for maintenance or budget reasons.
- Add manually to any park you know has water play that the LLM missed.
- Remove if the splash pad was removed or is permanently closed.

---

### `covered_area`
**Rule applied:** Assigned sparingly — only to community spaces or parks where a shelter, gazebo, or roof structure is implied by the venue type.

**Example:** *Espace citoyen* — a community civic space within a park, which typically includes some covered infrastructure for community events.

**Review guidance:**
- Keep if the park has a gazebo, covered pavilion, or sheltered picnic area.
- Add manually to any park with a covered play structure or shade shelter — this is valuable for hot days and light rain.
- Most small neighbourhood parks did not receive this tag. Add it if you know of a shelter.
