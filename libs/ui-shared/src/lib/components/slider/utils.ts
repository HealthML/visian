import { useCallback } from "react";

export interface Pointer {
  clientX: number;
  clientY: number;
}

const conformToStepSize = (value: number, stepSize?: number) =>
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
    Math.min(1, (conformToStepSize(value, stepSize) - min) / (max - min)),
  );
  return `${(inverted ? 1 - relativeValue : relativeValue) * 100}%`;
};

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
  return conformToStepSize(
    (inverted ? 1 - relativePos : relativePos) * (max - min) + min,
    stepSize,
  );
};

interface EventLike {
  preventDefault: () => void;
}

type EventHandler = (e: EventLike) => void;

/**
 * A simple hook that calls event handler
 * and ensures preventDefault is called.
 *
 * @param handler The event handler called on tap events.
 * @param args Additional arguments to be passed to the event handler.
 * @returns The bound event handler.
 */
export const usePreventDefault = (handler?: EventHandler) =>
  useCallback(
    (event: EventLike) => {
      event.preventDefault();
      if (handler) handler(event);
    },
    [handler],
  );

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
  startHandler?: (event: PointerEvent) => void,
  moveHandler?: (event: PointerEvent) => void,
  endHandler?: (event: PointerEvent) => void,
) => {
  const boundMoveHandler = usePreventDefault(moveHandler as EventHandler);
  const boundEndHandler = usePreventDefault(
    useCallback(
      (event: PointerEvent) => {
        document.removeEventListener("pointermove", boundMoveHandler);
        document.removeEventListener("pointerup", boundEndHandler);
        document.removeEventListener("pointerleave", boundEndHandler);
        if (endHandler) endHandler(event);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [boundMoveHandler, endHandler],
    ) as EventHandler,
  );
  const boundStartHandler = usePreventDefault(
    useCallback(
      (event: PointerEvent) => {
        document.addEventListener("pointermove", boundMoveHandler, {
          passive: false,
        });
        document.addEventListener("pointerup", boundEndHandler);
        document.addEventListener("pointerleave", boundEndHandler);
        if (startHandler) startHandler(event);
      },
      [boundEndHandler, boundMoveHandler, startHandler],
    ) as EventHandler,
  );

  return {
    onPointerDown: boundStartHandler,
  };
};
