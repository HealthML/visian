import React, { useCallback, useRef, useState } from "react";
import { useTheme } from "styled-components";

import { parseNumberFromMetric, Theme } from "../../theme";
import { InputContainer, Spacer } from "../box";
import { Tooltip } from "../tooltip";
import { SliderMarker, SliderRangeMarker } from "./markers";
import { SliderFieldProps, SliderProps } from "./slider.props";
import {
  SliderContainer,
  SliderLabel,
  SliderLabelRow,
  SliderRangeSelection,
  SliderThumb,
  SliderTrack,
  SliderValueInput,
  SliderValueInputWrapper,
} from "./styled-components";
import { pointerToSliderValue, useDrag, valueToSliderPos } from "./utils";

// Utilities
const defaultFormatLabel = (values: number[]) =>
  values.map((value) => value.toFixed(2)).join("-");

const isRangeMarker = (marker: {
  color?: string;
  value: number | [number, number];
}): marker is { context?: string; color?: string; value: [number, number] } =>
  Array.isArray(marker.value);

/** A custom slider component built to work well with touch input. */
export const Slider: React.FC<SliderProps> = (props) => {
  const {
    children,
    defaultValue,
    isInverted,
    isVertical,
    min = 0,
    max = 1,
    enforceSerialThumbs: preventCrossing,
    stepSize,
    roundMethod,
    scaleType,
    showRange,
    showFloatingValueLabel = false,
    formatValueLabel = defaultFormatLabel,
    markers,
    value,
    onChange,
    onStart,
    onEnd,
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

  const getSliderRelativePosition = (thumbValue: number) =>
    valueToSliderPos(thumbValue, {
      scaleType,
      min,
      max,
      stepSize,
      roundMethod,
      isInverted,
    });
  const thumbPositions = valueArray.map(getSliderRelativePosition);

  const expandedMarkers = markers?.map((marker) =>
    typeof marker === "number" || Array.isArray(marker)
      ? { value: marker }
      : marker,
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
      {expandedMarkers?.map((marker) =>
        isRangeMarker(marker) ? (
          <SliderRangeMarker
            key={`${marker.context}::${marker.color}:${marker.value[0]}-${marker.value[1]}`}
            from={getSliderRelativePosition(marker.value[0])}
            to={getSliderRelativePosition(marker.value[1])}
            isVertical={isVertical}
            color={marker.color}
            isActive={Boolean(
              ~valueArray.findIndex(
                (thumbValue) =>
                  thumbValue >= Math.min(...marker.value) &&
                  thumbValue <= Math.max(...marker.value),
              ),
            )}
          />
        ) : (
          <SliderMarker
            key={`${marker.context}::${marker.color}:${marker.value}`}
            position={getSliderRelativePosition(
              (marker.value as unknown) as number,
            )}
            isVertical={isVertical}
            color={marker.color}
            isActive={Boolean(
              ~valueArray.findIndex(
                (thumbValue) => thumbValue === marker.value,
              ),
            )}
          />
        ),
      )}
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
          anchor={thumbRef}
          position="left"
          distance={
            (parseNumberFromMetric(theme.sizes.sliderHeight) -
              parseNumberFromMetric(theme.sizes.sliderThumbHeight)) /
              2 +
            parseNumberFromMetric(theme.space.sliderLabelDistance)
          }
        />
      )}
      {children}
    </SliderContainer>
  );
};

export const SliderField: React.FC<SliderFieldProps> = ({
  labelTx,
  label,
  showValueLabel = true,
  unlockValueLabelRange,
  formatValueLabel = defaultFormatLabel,
  value,
  defaultValue,
  min = 0,
  max = 1,
  onChange,
  onValueLabelChange,
  ...rest
}) => {
  const actualValue = value === undefined ? defaultValue || min : value;

  const handleTextInputConfirm = useCallback(
    (newValue: number) => {
      const clampedValue = unlockValueLabelRange
        ? newValue
        : Math.max(min, Math.min(max, newValue));
      if (onChange) onChange(clampedValue, 0, clampedValue);
      if (onValueLabelChange) onValueLabelChange(clampedValue);
    },
    [max, min, onChange, onValueLabelChange, unlockValueLabelRange],
  );

  return (
    <InputContainer>
      {(labelTx || label || showValueLabel) && (
        <SliderLabelRow>
          {(labelTx || label) && <SliderLabel text={label} tx={labelTx} />}
          {showValueLabel &&
            (Array.isArray(actualValue) ? (
              <>
                <Spacer />
                <SliderLabel
                  text={formatValueLabel(
                    Array.isArray(actualValue) ? actualValue : [actualValue],
                  )}
                />
              </>
            ) : (
              <SliderValueInputWrapper>
                <SliderValueInput
                  type="number"
                  value={formatValueLabel([actualValue])}
                  onConfirm={handleTextInputConfirm}
                />
              </SliderValueInputWrapper>
            ))}
        </SliderLabelRow>
      )}
      <Slider
        {...rest}
        value={value}
        defaultValue={defaultValue}
        min={min}
        max={max}
        onChange={onChange}
      />
    </InputContainer>
  );
};
