/** Shared compact ring size — skeleton, loading, and summary must match. */
export const COMPACT_MACRO_RING_PX = 52;

/** Day-change intro: ring fill duration + stagger (ms). */
export const DAY_LOAD_RING_FILL_MS = 1100;
export const DAY_LOAD_RING_STAGGER_MS = 140;

/** When to reveal skeleton/labels after ring intro starts. */
export function dayLoadRingIntroDurationMs(): number {
  return DAY_LOAD_RING_FILL_MS + DAY_LOAD_RING_STAGGER_MS * 3 + 120;
}
