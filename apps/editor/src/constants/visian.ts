/** The minimum wait time in ms b/w writing the store to local storage. */
export const storePersistInterval = 10000;

// UI Interactions
export const minZoom = 0.8;
export const maxZoom = 100;
export const zoomStep = 0.15;
export const skipSlices = 10;

export const maxUndoRedoSteps = 20;

export const errorDisplayDuration = 12000;

export const defaultAnnotationOpacity = 0.5;
export const defaultAnnotationColor = "Genome Gold";
export const defaultRegionGrowingPreviewColor = "Smart Sapphire";
export const defaultImageColor = "Mighty Mercury";

/**
 * The minimum difference between voxel spacings that results in a new default
 * view type.
 */
export const viewTypeDepthThreshold = 0.05;

// Obfuscated using HEX representation to prevent spam
export const feedbackMailAddress =
  "%76%69%73%69%61%6E%2D%74%65%61%6D%40%6C%69%73%74%73%2E%6D%79%68%70%69%2E%64%65";

/**
 * The minimum number of milliseconds to pass before issuing another tracking
 * event for frequently firing event sources (e.g., pointer move).
 */
export const minTrackingEventInterval = 200;
