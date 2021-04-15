import { PointerEvent as ReactPointerEvent, useCallback, useRef } from "react";

import type {
  PointerCoordinates,
  roundMethod,
  scaleType,
  SliderValueSettings,
  SliderVerticalitySettings,
} from "./types";

/**
 * Applies a function to the given value to produce a (non-uniform) slider scale.
 *
 * @param value A [0, 1]-ranged value.
 * @param shouldInvert If `true`, inverts the applied function.
 */
export const applyScale = (
  value: number,
  scaleType?: scaleType,
  shouldInvert?: boolean,
) => {
  switch (scaleType) {
    case "quadratic":
      if (shouldInvert) {
        return value < 0 ? -Math.sqrt(-value) : Math.sqrt(value);
      }
      return value < 0 ? -value * value : value * value;

    default:
      return value;
  }
};

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
 *
 * @return A [0, 1]-ranged value indicating the relative position.
 */
export const valueToSliderPos = (
  value: number,
  sliderConfig: SliderValueSettings,
) => {
  const { min = 0, max = 1 } = sliderConfig;

  const relativeValue = applyScale(
    Math.max(
      0,
      Math.min(
        1,
        (roundToStepSize(
          value,
          sliderConfig.stepSize,
          sliderConfig.roundMethod,
        ) -
          min) /
          (max - min),
      ),
    ),
    sliderConfig.scaleType,
    true,
  );
  return sliderConfig.isInverted ? 1 - relativeValue : relativeValue;
};

/** Returns the slider's value from a pointer event to it. */
export const pointerToSliderValue = (
  pointer: PointerCoordinates,
  slider: HTMLElement,
  sliderConfig: SliderValueSettings & SliderVerticalitySettings,
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
    applyScale(
      sliderConfig.isInverted ? 1 - relativePos : relativePos,
      sliderConfig.scaleType,
    ) *
      (max - min) +
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
export const useDrag = <ID = string>(
  startHandler?: (event: PointerEvent | ReactPointerEvent, id?: ID) => void,
  moveHandler?: (event: PointerEvent | ReactPointerEvent, id?: ID) => void,
  endHandler?: (event: PointerEvent | ReactPointerEvent, id?: ID) => void,
) => {
  const idRef = useRef<Record<number, ID | undefined>>({});

  const boundMoveHandler = useCallback(
    (event: PointerEvent | ReactPointerEvent) => {
      if (idRef.current[event.pointerId] === undefined) return;

      event.preventDefault();
      if (moveHandler)
        return moveHandler(event, idRef.current[event.pointerId]);
    },
    [moveHandler],
  );

  const boundEndHandler = useCallback(
    (event: PointerEvent | ReactPointerEvent) => {
      if (idRef.current[event.pointerId] === undefined) return;
      const id = idRef.current[event.pointerId];
      delete idRef.current[event.pointerId];

      event.preventDefault();

      if (!Object.keys(idRef.current).length) {
        document.removeEventListener("pointermove", boundMoveHandler);
        document.removeEventListener("pointerup", boundEndHandler);
        document.removeEventListener("pointerleave", boundEndHandler);
      }
      if (endHandler) return endHandler(event, id);
    },
    [boundMoveHandler, endHandler],
  );

  const boundStartHandler = useCallback(
    (event: PointerEvent | ReactPointerEvent, id?: ID) => {
      idRef.current[event.pointerId] = id;
      event.preventDefault();

      if (Object.keys(idRef.current).length === 1) {
        document.addEventListener("pointermove", boundMoveHandler, {
          passive: false,
        });
        document.addEventListener("pointerup", boundEndHandler);
        document.addEventListener("pointerleave", boundEndHandler);
      }
      if (startHandler) return startHandler(event, id);
    },
    [boundEndHandler, boundMoveHandler, startHandler],
  );

  return {
    onPointerDown: boundStartHandler,
  };
};
