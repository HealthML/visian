import React, { useCallback, useRef, useState } from "react";
import { useTheme } from "styled-components";

import { parseNumberFromMetric, Theme } from "../../theme";
import { FlexRow, InputContainer, Spacer } from "../box";
import { SliderLabel } from "../text";
import { Tooltip } from "../tooltip";
import { SliderFieldProps, SliderProps } from "./slider.props";
import {
  SliderContainer,
  SliderRangeSelection,
  SliderThumb,
  SliderTrack,
} from "./styled-components";
import { pointerToSliderValue, useDrag, valueToSliderPos } from "./utils";

const defaultFormatLabel = (values: number[]) =>
  values.map((value) => value.toFixed(2)).join("-");

/** A custom slider component built to work well with touch input. */
export const Slider: React.FC<SliderProps> = (props) => {
  const {
    children,
    defaultValue,
    isInverted,
    isVertical,
    min = 0,
    max = 1,
    onChange,
    onStart,
    onEnd,
    enforceSerialThumbs: preventCrossing,
    roundMethod,
    scaleType,
    showRange,
    showFloatingValueLabel = false,
    formatValueLabel = defaultFormatLabel,
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
    (event: PointerEvent | React.PointerEvent, id: number) => {
      if ((!onChange && !onStart) || !sliderRef.current) return;

      if (event.type === "pointerdown") {
        if (onStart) onStart(event, id);
      }

      if (!onChange) return;
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
        onChange(newThumbValue, id, newThumbValue);
        return;
      }

      const newValueArray = valueRef.current.slice();
      switch (preventCrossing) {
        case "block": {
          let blockedThumbValue = newThumbValue;

          const lowerId = Math.max(0, id - 1);
          if (lowerId !== id) {
            blockedThumbValue = Math.max(
              newValueArray[lowerId],
              blockedThumbValue,
            );
          }

          const upperId = Math.min(id + 1, newValueArray.length - 1);
          if (upperId !== id) {
            blockedThumbValue = Math.min(
              blockedThumbValue,
              newValueArray[upperId],
            );
          }

          newValueArray[id] = blockedThumbValue;
          onChange(newValueArray, id, blockedThumbValue);
          return;
        }

        case "push": {
          newValueArray[id] = newThumbValue;
          for (let index = id - 1; index >= 0; index--) {
            newValueArray[index] = Math.min(
              newValueArray[index],
              newThumbValue,
            );
          }

          const { length } = newValueArray;
          for (let index = id + 1; index < length; index++) {
            newValueArray[index] = Math.max(
              newThumbValue,
              newValueArray[index],
            );
          }
          onChange(newValueArray, id, newThumbValue);
          return;
        }

        default:
          newValueArray[id] = newThumbValue;
          onChange(newValueArray, id, newThumbValue);
          return;
      }
    },
    [
      isInverted,
      max,
      min,
      onChange,
      onStart,
      preventCrossing,
      roundMethod,
      stepSize,
      isVertical,
      scaleType,
    ],
  );

  const { onPointerDown } = useDrag(updateValue, updateValue, onEnd);
  const startDrag = useCallback(
    (event: PointerEvent | React.PointerEvent) => {
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

      let minDistance = Infinity;
      let closestThumb = 0;
      valueRef.current.forEach((thumbValue, index) => {
        const distance = Math.abs(thumbValue - newThumbValue);
        if (distance < minDistance) {
          minDistance = distance;
          closestThumb = index;
        }
      });
      onPointerDown(event, closestThumb);
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

  // Tooltip Positioning
  const [thumbRef, setThumbRef] = useState<HTMLDivElement | null>(null);
  const theme = useTheme() as Theme;

  return (
    <SliderContainer
      {...rest}
      onPointerDown={startDrag}
      isVertical={isVertical}
      ref={sliderRef}
    >
      <SliderTrack isVertical={isVertical} />
      {showRange && valueArray.length >= 2 && (
        <SliderRangeSelection
          isInverted={isInverted}
          isVertical={isVertical}
          positions={thumbPositions}
        />
      )}
      {valueArray.map((_thumbValue, index) => {
        const thumbPos = thumbPositions[index];
        return (
          <SliderThumb
            key={index}
            isVertical={isVertical}
            position={thumbPos}
            ref={index ? undefined : setThumbRef}
          />
        );
      })}
      {showFloatingValueLabel && (
        <Tooltip
          text={formatValueLabel([valueArray[0]])}
          parentElement={thumbRef}
          position="left"
          distance={parseNumberFromMetric(theme.sizes.sliderHeight) / 2 + 10}
        />
      )}
      {children}
    </SliderContainer>
  );
};

export const SliderField: React.FC<SliderFieldProps> = ({
  labelTx,
  label,
  showValueLabel,
  formatValueLabel = defaultFormatLabel,
  value,
  defaultValue,
  min = 0,
  ...rest
}) => {
  const actualValue = value === undefined ? defaultValue || min : value;

  return (
    <InputContainer>
      {(labelTx || label || showValueLabel) && (
        <FlexRow>
          {(labelTx || label) && <SliderLabel text={label} tx={labelTx} />}
          <Spacer />
          {showValueLabel && (
            <SliderLabel
              text={formatValueLabel(
                Array.isArray(actualValue) ? actualValue : [actualValue],
              )}
            />
          )}
        </FlexRow>
      )}
      <Slider {...rest} value={value} defaultValue={defaultValue} min={min} />
    </InputContainer>
  );
};
