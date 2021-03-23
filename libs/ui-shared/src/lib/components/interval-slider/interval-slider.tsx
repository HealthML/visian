import React, {
  PointerEvent as ReactPointerEvent,
  useCallback,
  useRef,
} from "react";
import styled from "styled-components";

import {
  color,
  computeStyleValue,
  scaleMetric,
  size,
  ThemeProps,
} from "../../theme";
import {
  pointerToSliderValue,
  SliderContainer,
  SliderThumb,
  SliderTrack,
  ThumbProps,
  useDrag,
  valueToSliderPos,
} from "../slider";

import type { IntervalSliderProps } from "./interval-slider.props";

export const SliderThumbTouchBox = styled.div.attrs<ThumbProps>((props) => {
  const thumbPositionMain = `${props.position * 100}%`;

  return {
    style: {
      top: props.isVertical ? thumbPositionMain : 0,
      left: props.isVertical ? 0 : thumbPositionMain,
    },
  };
})<ThumbProps>`
  height: ${size("sliderHeight")};
  margin: ${(props) => {
    const margin = scaleMetric(size("sliderHeight")(props), -0.5);
    return props.isVertical ? `${margin} 0 0 0` : `0 0 0 ${margin}`;
  }};
  position: absolute;
  width: ${size("sliderHeight")};
  z-index: 20;
`;

export interface SliderRangeSelectionProps {
  lowPos: number;
  highPos: number;
  isVertical?: boolean;
}

export const SliderRangeSelection = styled.div.attrs<SliderRangeSelectionProps>(
  (props) => ({
    style: props.isVertical
      ? {
          top: `${props.lowPos * 100}%`,
          bottom: `${(1 - props.highPos) * 100}%`,
        }
      : {
          left: `${props.lowPos * 100}%`,
          right: `${(1 - props.highPos) * 100}%`,
        },
  }),
)<SliderRangeSelectionProps>`
  background-color: ${color("gray")};
  ${(props) => {
    const across = computeStyleValue<ThemeProps>(
      [size("sliderHeight")],
      (sliderHeight) => sliderHeight / 2 - 1.5,
    )(props);
    return props.isVertical
      ? {
          left: across,
          right: across,
        }
      : {
          top: across,
          bottom: across,
        };
  }}
  position: absolute;
  z-index: 10;
`;

/** A custom interval slider component built to work well with touch input. */
export const IntervalSlider: React.FC<IntervalSliderProps> = (props) => {
  const {
    defaultValue,
    isInverted,
    isVertical,
    min = 0,
    max = 1,
    onChange,
    roundMethod,
    scaleType,
    stepSize,
    value,
    ...rest
  } = props;

  const sliderRef = useRef<HTMLDivElement | null>(null);

  const actualValue = value === undefined ? defaultValue || [0, 1] : value;
  const currentValueRef = useRef<[number, number]>(actualValue);
  currentValueRef.current = actualValue;

  const updateValue = useCallback(
    (event: PointerEvent | ReactPointerEvent, id?: string) => {
      if (!onChange || !sliderRef.current) return;
      const newValue = pointerToSliderValue(event, sliderRef.current, {
        scaleType,
        min,
        max,
        stepSize,
        roundMethod,
        isInverted,
        isVertical,
      });

      onChange(
        id === "low"
          ? [newValue, Math.max(newValue, currentValueRef.current[1])]
          : [Math.min(currentValueRef.current[0], newValue), newValue],
      );
    },
    [
      isInverted,
      max,
      min,
      onChange,
      roundMethod,
      stepSize,
      isVertical,
      scaleType,
    ],
  );

  const { onPointerDown } = useDrag(updateValue, updateValue);
  const setLowValue = useCallback(
    (event: PointerEvent | ReactPointerEvent) => {
      onPointerDown(event, "low");
    },
    [onPointerDown],
  );
  const setHighValue = useCallback(
    (event: PointerEvent | ReactPointerEvent) => {
      onPointerDown(event, "high");
    },
    [onPointerDown],
  );

  const lowThumbPos = valueToSliderPos(actualValue[0], {
    scaleType,
    min,
    max,
    stepSize,
    roundMethod,
    isInverted,
  });
  const highThumbPos = valueToSliderPos(actualValue[1], {
    scaleType,
    min,
    max,
    stepSize,
    roundMethod,
    isInverted,
  });

  return (
    <SliderContainer {...rest} isVertical={isVertical} ref={sliderRef}>
      <SliderTrack isVertical={isVertical} />

      <SliderRangeSelection
        lowPos={isInverted ? highThumbPos : lowThumbPos}
        highPos={isInverted ? lowThumbPos : highThumbPos}
        isVertical={isVertical}
      />

      <SliderThumb isVertical={isVertical} position={lowThumbPos} />
      <SliderThumbTouchBox
        isVertical={isVertical}
        position={lowThumbPos}
        onPointerDown={setLowValue}
      />

      <SliderThumb isVertical={isVertical} position={highThumbPos} />
      <SliderThumbTouchBox
        isVertical={isVertical}
        position={highThumbPos}
        onPointerDown={setHighValue}
      />
    </SliderContainer>
  );
};

export default IntervalSlider;
