export enum WheelInteractionType {
  "Up" = 0,
  "None" = 1,
  "Down" = 2,
}

export const getWheelInteractionType = (event: WheelEvent) =>
  (Math.sign((event as WheelEvent).deltaY) + 1) as WheelInteractionType;

/** Returns the translation delta to zoom to a given point for one axis. */
export const getZoomToCursorDelta1D = (
  cursorPosition: number,
  transformOrigin: number,
  scaleFactor: number,
) => (transformOrigin - cursorPosition) * (scaleFactor - 1);

export const offsetOriginByZoomToCursorDelta = (
  event: { clientX: number; clientY: number },
  transformOrigin: { x: number; y: number },
  scaleFactor: number,
) => ({
  x:
    getZoomToCursorDelta1D(event.clientX, transformOrigin.x, scaleFactor) +
    transformOrigin.x,
  y:
    getZoomToCursorDelta1D(event.clientY, transformOrigin.y, scaleFactor) +
    transformOrigin.y,
});
