import { useCallback, useRef, PointerEvent as ReactPointerEvent } from "react";

export interface Pointer {
  clientX: number;
  clientY: number;
}

const roundToStepSize = (value: number, stepSize?: number) =>
  stepSize ? Math.round(value / stepSize) * stepSize : value;

export const valueToSliderPos = (
  value: number,
  min = 0,
  max = 99,
  inverted = false,
  stepSize?: number,
) => {
  const relativeValue = Math.max(
    0,
    Math.min(1, (roundToStepSize(value, stepSize) - min) / (max - min)),
  );
  return `${(inverted ? 1 - relativeValue : relativeValue) * 100}%`;
};

/** Extracts */
export const pointerToSliderValue = (
  pointer: Pointer,
  slider: HTMLElement,
  min = 0,
  max = 99,
  vertical = false,
  inverted = false,
  stepSize?: number,
) => {
  const boundingBox = slider.getBoundingClientRect();

  const relativePos = Math.max(
    0,
    Math.min(
      1,
      vertical
        ? (pointer.clientY - boundingBox.y) / boundingBox.height
        : (pointer.clientX - boundingBox.x) / boundingBox.width,
    ),
  );
  return roundToStepSize(
    (inverted ? 1 - relativePos : relativePos) * (max - min) + min,
    stepSize,
  );
};

/**
 * A simple hook to include a cross-platform drag handler.
 * Note: Currently, it only works with pointer events.
 *
 * @param startHandler The event handler called on a drag start.
 * @param moveHandler The event handler called on a drag move.
 * @param endHandler The event handler called on a drag end.
 * @returns An object containing the applicable start event listener(s).
 * It should be applied to a React element using the spread syntax.
 */
export const useDrag = (
  startHandler?: (event: PointerEvent | ReactPointerEvent) => void,
  moveHandler?: (event: PointerEvent | ReactPointerEvent) => void,
  endHandler?: (event: PointerEvent | ReactPointerEvent) => void,
) => {
  const pointerIdRef = useRef<number | undefined>();

  const boundMoveHandler = useCallback(
    (event: PointerEvent | ReactPointerEvent) => {
      if (event.pointerId !== pointerIdRef.current) return;

      event.preventDefault();
      if (moveHandler) return moveHandler(event);
    },
    [moveHandler],
  );

  const boundEndHandler = useCallback(
    (event: PointerEvent | ReactPointerEvent) => {
      if (event.pointerId !== pointerIdRef.current) return;
      pointerIdRef.current = undefined;

      event.preventDefault();
      document.removeEventListener("pointermove", boundMoveHandler);
      document.removeEventListener("pointerup", boundEndHandler);
      document.removeEventListener("pointerleave", boundEndHandler);
      if (endHandler) return endHandler(event);
    },
    [boundMoveHandler, endHandler],
  );

  const boundStartHandler = useCallback(
    (event: PointerEvent | ReactPointerEvent) => {
      pointerIdRef.current = event.pointerId;
      event.preventDefault();
      document.addEventListener("pointermove", boundMoveHandler, {
        passive: false,
      });
      document.addEventListener("pointerup", boundEndHandler);
      document.addEventListener("pointerleave", boundEndHandler);
      if (startHandler) return startHandler(event);
    },
    [boundEndHandler, boundMoveHandler, startHandler],
  );

  return {
    onPointerDown: boundStartHandler,
  };
};
