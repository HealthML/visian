import { PointerEvent as ReactPointerEvent, useCallback, useRef } from "react";

import type { PointerCoordinates, roundMethod, SliderConfig } from "./types";

export const roundToStepSize = (
  value: number,
  stepSize?: number,
  roundMethod?: roundMethod,
) => {
  if (!stepSize) return value;

  switch (roundMethod) {
    case "floor":
      return Math.floor(value / stepSize) * stepSize;

    case "ceil":
      return Math.ceil(value / stepSize) * stepSize;

    default:
      return Math.round(value / stepSize) * stepSize;
  }
};

/**
 * Returns the relative position of the slider's thumb along the main axis
 * based on it's current value.
 */
export const valueToSliderPos = (
  value: number,
  sliderConfig: Omit<SliderConfig, "isVertical">,
) => {
  const { min = 0, max = 1 } = sliderConfig;

  const relativeValue = Math.max(
    0,
    Math.min(
      1,
      (roundToStepSize(value, sliderConfig.stepSize, sliderConfig.roundMethod) -
        min) /
        (max - min),
    ),
  );
  return `${
    (sliderConfig.isInverted ? 1 - relativeValue : relativeValue) * 100
  }%`;
};

/** Returns the slider's value from a pointer event to it. */
export const pointerToSliderValue = (
  pointer: PointerCoordinates,
  slider: HTMLElement,
  sliderConfig: SliderConfig,
) => {
  const { min = 0, max = 1 } = sliderConfig;

  const boundingBox = slider.getBoundingClientRect();

  const relativePos = Math.max(
    0,
    Math.min(
      1,
      sliderConfig.isVertical
        ? (pointer.clientY - boundingBox.y) / boundingBox.height
        : (pointer.clientX - boundingBox.x) / boundingBox.width,
    ),
  );
  return roundToStepSize(
    (sliderConfig.isInverted ? 1 - relativePos : relativePos) * (max - min) +
      min,
    sliderConfig.stepSize,
    sliderConfig.roundMethod,
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
