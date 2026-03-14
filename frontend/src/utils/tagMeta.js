/**
 * tagMeta.js
 *
 * Single source of truth for all venue tag metadata.
 *
 * ── Confirmed vs. Unconfirmed ──────────────────────────────────────────────────
 * A place is "confirmed" once a user has reviewed it and verified that the
 * reported tags still accurately reflect the venue.  This is necessary because
 * crowdsourced data can go stale — a café may remove its changing table or add
 * a play corner.  User-confirmed data gives parents higher confidence.
 *
 * This distinction is surfaced through icon style:
 *   FilledIcon   →  confirmed  (a real user has vouched for this tag recently)
 *   OutlineIcon  →  unconfirmed (tag was reported but not yet user-verified)
 *
 * Note on TbHorseToy (play_area):
 *   Tabler Icons does not ship a filled variant for TbHorseToy.  The same icon
 *   is used in both states; the confirmed/unconfirmed distinction is instead
 *   communicated via opacity (full = confirmed, 50% = unconfirmed).
 *
 * ── TAG_META shape ─────────────────────────────────────────────────────────────
 * Each entry exposes:
 *   label       {string}    Full display label (used in MainInfoCard tag rows)
 *   FilledIcon  {Component} react-icons component for the confirmed state
 *   OutlineIcon {Component} react-icons component for the unconfirmed state
 *   color       {string}    Tailwind text-colour class applied to the icon
 */

import {
  MdChildFriendly,
  MdOutlineChildFriendly,
  MdBabyChangingStation,
  MdOutlineBabyChangingStation,
  MdChair,
  MdOutlineChair,
  MdFamilyRestroom,
  MdOutlineFamilyRestroom,
} from 'react-icons/md'

import { TbHorseToy } from 'react-icons/tb'

export const TAG_META = {
  stroller_friendly: {
    label:       'Stroller-friendly spaces',
    FilledIcon:  MdChildFriendly,
    OutlineIcon: MdOutlineChildFriendly,
    color:       'text-green-400',
  },
  changing_table: {
    label:       'Diaper changing tables',
    FilledIcon:  MdBabyChangingStation,
    OutlineIcon: MdOutlineBabyChangingStation,
    color:       'text-green-400',
  },
  play_area: {
    label: 'Play area',
    // TbHorseToy has no filled variant in this icon set.
    // Confirmed vs. unconfirmed is communicated via opacity instead of shape.
    FilledIcon:  TbHorseToy,
    OutlineIcon: TbHorseToy,
    color:       'text-emerald-400',
  },
  high_chairs: {
    label:       'High chairs',
    FilledIcon:  MdChair,
    OutlineIcon: MdOutlineChair,
    color:       'text-green-400',
  },
  unisex_baby_duty: {
    label:       'Unisex baby duty spaces',
    FilledIcon:  MdFamilyRestroom,
    OutlineIcon: MdOutlineFamilyRestroom,
    color:       'text-green-300',
  },
}

/**
 * TAG_LABELS — flat key→label map derived from TAG_META.
 * Imported by FilterBar (for filter chips) and any other component that only
 * needs human-readable names without icon logic.
 */
export const TAG_LABELS = Object.fromEntries(
  Object.entries(TAG_META).map(([key, { label }]) => [key, label])
)
