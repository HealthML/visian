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
import {
  SliderProps,
  SliderRangeSelectionProps,
  ThumbProps,
} from "./slider.props";
import { SliderStylingSettings, SliderVerticalitySettings } from "./types";
import { pointerToSliderValue, useDrag, valueToSliderPos } from "./utils";

// Styled Components
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

export const SliderRangeSelection = styled.div.attrs<SliderRangeSelectionProps>(
  (props) => {
    return {
      style: props.isVertical
        ? {
            top: `${
              props.positions[
                props.isInverted ? props.positions.length - 1 : 0
              ] * 100
            }%`,
            bottom: `${
              (1 -
                props.positions[
                  props.isInverted ? 0 : props.positions.length - 1
                ]) *
              100
            }%`,
          }
        : {
            left: `${
              props.positions[
                props.isInverted ? props.positions.length - 1 : 0
              ] * 100
            }%`,
            right: `${
              (1 -
                props.positions[
                  props.isInverted ? 0 : props.positions.length - 1
                ]) *
              100
            }%`,
          },
    };
  },
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

const defaultFormatLabel = (value: number) =>
  `${Math.round(value * 100) / 100}`;

/** A custom slider component built to work well with touch input. */
export const Slider: React.FC<SliderProps> = (props) => {
  const {
    children,
    defaultValue,
    formatLabel = defaultFormatLabel,
    isInverted,
    isVertical,
    min = 0,
    max = 1,
    onChange,
    enforceSerialThumbs: preventCrossing,
    roundMethod,
    scaleType,
    shouldShowLabel,
    shouldShowRange,
    stepSize,
    value,
    ...rest
  } = props;

  const sliderRef = useRef<HTMLDivElement | null>(null);

  const actualValue = value === undefined ? defaultValue || min : value;
  const valueArray: number[] = Array.isArray(actualValue)
    ? actualValue
    : [actualValue];
  const valueRef = useRef<number | number[]>(actualValue);
  valueRef.current = actualValue;

  const updateValue = useCallback(
    (event: PointerEvent | ReactPointerEvent, id?: number) => {
      if (!onChange || !sliderRef.current) return;

      const actualId = id || 0;
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
        onChange(newThumbValue, actualId, newThumbValue);
        return;
      }

      const newValueArray = valueRef.current.slice();
      switch (preventCrossing) {
        case "block": {
          let blockedThumbValue = newThumbValue;

          const lowerId = Math.max(0, actualId - 1);
          if (lowerId !== actualId) {
            blockedThumbValue = Math.max(
              newValueArray[lowerId],
              blockedThumbValue,
            );
          }

          const upperId = Math.min(actualId + 1, newValueArray.length - 1);
          if (upperId !== actualId) {
            blockedThumbValue = Math.min(
              blockedThumbValue,
              newValueArray[upperId],
            );
          }

          newValueArray[actualId] = blockedThumbValue;
          onChange(newValueArray, actualId, blockedThumbValue);
          return;
        }

        case "push": {
          newValueArray[actualId] = newThumbValue;
          for (let index = actualId - 1; index >= 0; index--) {
            newValueArray[index] = Math.min(
              newValueArray[index],
              newThumbValue,
            );
          }

          const { length } = newValueArray;
          for (let index = actualId + 1; index < length; index++) {
            newValueArray[index] = Math.max(
              newThumbValue,
              newValueArray[index],
            );
          }
          onChange(newValueArray, actualId, newThumbValue);
          return;
        }

        default:
          newValueArray[actualId] = newThumbValue;
          onChange(newValueArray, actualId, newThumbValue);
          return;
      }
    },
    [
      isInverted,
      max,
      min,
      onChange,
      preventCrossing,
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

  const thumbPositions = valueArray.map((thumbValue) =>
    valueToSliderPos(thumbValue, {
      scaleType,
      min,
      max,
      stepSize,
      roundMethod,
      isInverted,
    }),
  );

  return (
    <SliderContainer
      {...rest}
      onPointerDown={startDrag}
      isVertical={isVertical}
      ref={sliderRef}
    >
      <SliderTrack isVertical={isVertical} />
      {shouldShowRange && valueArray.length >= 2 && (
        <SliderRangeSelection
          isInverted={isInverted}
          isVertical={isVertical}
          positions={thumbPositions}
        />
      )}
      {valueArray.map((thumbValue, index) => {
        const thumbPos = thumbPositions[index];
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
      {children}
    </SliderContainer>
  );
};

export default Slider;
