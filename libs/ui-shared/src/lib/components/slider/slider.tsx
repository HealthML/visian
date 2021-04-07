import React, {
  PointerEvent as ReactPointerEvent,
  useCallback,
  useRef,
} from "react";
import styled from "styled-components";

import {
  color,
  computeStyleValue,
  fontSize,
  lineHeight,
  scaleMetric,
  size,
  ThemeProps,
} from "../../theme";
import { Text } from "../text";
import { SliderProps, ThumbProps } from "./slider.props";
import { SliderStylingSettings, SliderVerticalitySettings } from "./types";
import { pointerToSliderValue, useDrag, valueToSliderPos } from "./utils";

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

export const SliderLabel = styled(Text).attrs<ThumbProps>((props) => {
  const thumbPositionMain = `${props.position * 100}%`;
  const thumbPositionAcross = computeStyleValue<ThemeProps>(
    [size("sliderHeight")],
    (sliderHeight) => -sliderHeight,
  )(props);

  return {
    style: {
      top: props.isVertical ? thumbPositionMain : thumbPositionAcross,
      left: props.isVertical ? thumbPositionAcross : thumbPositionMain,
    },
  };
})<ThumbProps & SliderStylingSettings>`
  display: block;
  line-height: ${fontSize("default")};
  margin: ${(props) =>
    props.isVertical
      ? `${scaleMetric(fontSize("default")(props), -0.5)} 0 0 0`
      : "0 0 0 -50%"};
  opacity: 0.6;
  position: absolute;
  text-align: ${(props) => (props.isVertical ? "right" : "center")};
  width: ${(props) => !props.isVertical && "100%"};
  z-index: 10;
`;

const defaultFormatLabel = (value: number) =>
  `${Math.round(value * 100) / 100}`;

/** A custom slider component built to work well with touch input. */
export const Slider: React.FC<SliderProps> = (props) => {
  const {
    defaultValue,
    formatLabel = defaultFormatLabel,
    isInverted,
    isVertical,
    min = 0,
    max = 1,
    onChange,
    roundMethod,
    scaleType,
    shouldShowLabel,
    stepSize,
    value,
    ...rest
  } = props;

  const sliderRef = useRef<HTMLDivElement | null>(null);

  const actualValue = value === undefined ? defaultValue || min : value;
  const values: number[] = Array.isArray(actualValue)
    ? actualValue
    : [actualValue];
  const valueRef = useRef<number | number[]>(actualValue);
  valueRef.current = actualValue;

  const updateValue = useCallback(
    (event: PointerEvent | ReactPointerEvent, id?: number) => {
      if (!onChange || !sliderRef.current) return;
      const newThumbValue = pointerToSliderValue(event, sliderRef.current, {
        scaleType,
        min,
        max,
        stepSize,
        roundMethod,
        isInverted,
        isVertical,
      });
      if (!Array.isArray(valueRef.current)) {
        onChange(newThumbValue, id || 0, newThumbValue);
        return;
      }

      const newValueArray = valueRef.current.slice();
      newValueArray[id || 0] = newThumbValue;
      onChange(newValueArray, id || 0, newThumbValue);
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
  const startDrag = useCallback(
    (event: PointerEvent | ReactPointerEvent) => {
      if (!onChange || !sliderRef.current) return;
      if (!Array.isArray(valueRef.current)) {
        onPointerDown(event, 0);
        return;
      }

      const newThumbValue = pointerToSliderValue(event, sliderRef.current, {
        scaleType,
        min,
        max,
        stepSize,
        roundMethod,
        isInverted,
        isVertical,
      });

      let minValue = Infinity;
      let minThumb = 0;
      valueRef.current.forEach((thumbValue, index) => {
        const distance = Math.abs(thumbValue - newThumbValue);
        if (distance < minValue) {
          minValue = distance;
          minThumb = index;
        }
      });
      onPointerDown(event, minThumb);
    },
    [
      onPointerDown,
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

  return (
    <SliderContainer
      {...rest}
      onPointerDown={startDrag}
      isVertical={isVertical}
      ref={sliderRef}
    >
      <SliderTrack isVertical={isVertical} />
      {values.map((thumbValue) => {
        const thumbPos = valueToSliderPos(thumbValue, {
          scaleType,
          min,
          max,
          stepSize,
          roundMethod,
          isInverted,
        });

        return (
          <>
            <SliderThumb isVertical={isVertical} position={thumbPos} />
            {shouldShowLabel && (
              <SliderLabel
                isVertical={isVertical}
                position={thumbPos}
                text={formatLabel(thumbValue)}
              />
            )}
          </>
        );
      })}
    </SliderContainer>
  );
};

export default Slider;
