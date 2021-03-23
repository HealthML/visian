import React, {
  PointerEvent as ReactPointerEvent,
  useCallback,
  useRef,
} from "react";
import styled from "styled-components";

import {
  color,
  computeStyleValue,
  lineHeight,
  scaleMetric,
  size,
  ThemeProps,
} from "../../theme";
import { Text } from "../text";
import { SliderProps } from "./slider.props";
import { SliderStylingSettings, SliderVerticalitySettings } from "./types";
import { pointerToSliderValue, useDrag, valueToSliderPos } from "./utils";

export interface ThumbProps extends SliderVerticalitySettings {
  /**
   * A [0, 1]-ranged value indicating the thumb's relative position along the
   * slider's main axis.
   */
  position: number;
}

export const SliderContainer = styled.div<SliderVerticalitySettings>`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: ${(props) => (props.isVertical ? "100%" : size("sliderHeight"))};
  position: relative;
  margin: ${(props) => {
    const margin = scaleMetric(size("sliderThumbWidth")(props), 0.5);
    return props.isVertical ? `${margin} 0` : `0 ${margin}`;
  }};
  touch-action: none;
  user-select: none;
  width: ${(props) => (props.isVertical ? size("sliderHeight") : "100%")};
  flex-direction: ${(props) => (props.isVertical ? "column" : "row")};
`;

export const SliderTrack = styled.div<SliderVerticalitySettings>`
  background-color: ${color("lightGray")};
  flex: 1;
  height: ${(props) =>
    props.isVertical ? "unset" : lineHeight("sliderTrack")};
  width: ${(props) => (props.isVertical ? lineHeight("sliderTrack") : "unset")};
`;

export const SliderThumb = styled.div.attrs<ThumbProps>((props) => {
  const thumbPositionMain = `${props.position * 100}%`;
  const thumbPositionAcross = computeStyleValue<ThemeProps>(
    [size("sliderHeight"), size("sliderThumbHeight")],
    (sliderHeight, thumbHeight) => (sliderHeight - thumbHeight) / 2,
  )(props);

  return {
    style: {
      top: props.isVertical ? thumbPositionMain : thumbPositionAcross,
      left: props.isVertical ? thumbPositionAcross : thumbPositionMain,
    },
  };
})<ThumbProps>`
  background-color: ${color("gray")};
  border: none;
  border-radius: ${(props) =>
    scaleMetric(size("sliderThumbWidth")(props), 0.5)};
  height: ${(props) =>
    props.isVertical ? size("sliderThumbWidth") : size("sliderThumbHeight")};
  margin: ${(props) => {
    const margin = scaleMetric(size("sliderThumbWidth")(props), -0.5);
    return props.isVertical ? `${margin} 0 0 0` : `0 0 0 ${margin}`;
  }};
  position: absolute;
  transition: background-color 0.3s;
  width: ${(props) =>
    props.isVertical ? size("sliderThumbHeight") : size("sliderThumbWidth")};
  z-index: 10;
`;

/** A custom slider component built to work well with touch input. */
export const Slider: React.FC<SliderProps> = (props) => {
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
  const updateValue = useCallback(
    (event: PointerEvent | ReactPointerEvent) => {
      if (!onChange || !sliderRef.current) return;
      onChange(
        pointerToSliderValue(event, sliderRef.current, {
          scaleType,
          min,
          max,
          stepSize,
          roundMethod,
          isInverted,
          isVertical,
        }),
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

  const dragListeners = useDrag(updateValue, updateValue);

  const actualValue = value === undefined ? defaultValue || 0 : value;
  const thumbPos = valueToSliderPos(actualValue, {
    scaleType,
    min,
    max,
    stepSize,
    roundMethod,
    isInverted,
  });

  return (
    <SliderContainer
      {...rest}
      {...(onChange ? dragListeners : {})}
      isVertical={isVertical}
      ref={sliderRef}
    >
      <SliderTrack isVertical={isVertical} />
      <SliderThumb isVertical={isVertical} position={thumbPos} />
    </SliderContainer>
  );
};

export default Slider;
