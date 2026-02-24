/**
 * Strip dimensions for the photobooth result.
 * Use these values to design template images that fit the captured photos.
 *
 * All values in "logical" pixels (same as STRIP_WIDTH scale).
 * For @2x export (ViewShot captures at 2x), double these numbers.
 */

export const STRIP_WIDTH = 280;

/** Padding inside the strip (all sides) */
export const STRIP_PADDING = 8;

/** Width available for photo slots (strip width minus horizontal padding) */
export const PHOTO_SLOT_WIDTH = STRIP_WIDTH - STRIP_PADDING * 2; // 264

/** Photo slot aspect ratio: width / height = 0.75 → height = width / 0.75 */
export const PHOTO_ASPECT_RATIO = 0.75; // 3:4 portrait

/** Height of each photo slot */
export const PHOTO_SLOT_HEIGHT = Math.round(PHOTO_SLOT_WIDTH / PHOTO_ASPECT_RATIO); // 352

/** Vertical gap between photo slots */
export const PHOTO_SLOT_GAP = 6;

/** Text panel vertical padding */
export const TEXT_PANEL_PADDING_V = 16;
/** Text panel horizontal padding */
export const TEXT_PANEL_PADDING_H = 12;

/** Approximate text panel height (title + names + date + brand) */
export const TEXT_PANEL_APPROX_HEIGHT = 100;

/**
 * Total strip height for a given number of photo slots (logical pixels).
 * Use this to set your template canvas height.
 */
export function getStripHeight(slotCount: 2 | 3 | 4): number {
  const photoAreaHeight =
    PHOTO_SLOT_HEIGHT * slotCount + PHOTO_SLOT_GAP * Math.max(0, slotCount - 1);
  return STRIP_PADDING * 2 + photoAreaHeight + TEXT_PANEL_APPROX_HEIGHT;
}

/** Strip dimensions at 1x (logical) for 2, 3, 4 slots */
export const STRIP_HEIGHT_2_SLOTS = getStripHeight(2);
export const STRIP_HEIGHT_3_SLOTS = getStripHeight(3);
export const STRIP_HEIGHT_4_SLOTS = getStripHeight(4);

/** For high-DPI export (e.g. ViewShot at 2x), multiply dimensions by this */
export const EXPORT_SCALE = 2;
