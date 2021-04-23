import React, {
  PointerEvent as ReactPointerEvent,
  useCallback,
  useRef,
} from "react";

import { InputContainer, Spacer } from "../box";
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
    enforceSerialThumbs: preventCrossing,
    roundMethod,
    scaleType,
    showRange,
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
          />
        );
      })}
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
  ...rest
}) => {
  const actualValue = value === undefined ? defaultValue || min : value;

  const handleTextInputConfirm = useCallback(
    (newValue: number) => {
      const clampedValue = unlockValueLabelRange
        ? newValue
        : Math.max(min, Math.min(max, newValue));
      if (onChange) onChange(clampedValue, 0, clampedValue);
    },
    [max, min, onChange, unlockValueLabelRange],
  );

  return (
    <InputContainer>
      {(labelTx || label || showValueLabel) && (
        <SliderLabelRow>
          {(labelTx || label) && <SliderLabel text={label} tx={labelTx} />}
          <Spacer />
          {showValueLabel &&
            (Array.isArray(actualValue) ? (
              <SliderLabel
                text={formatValueLabel(
                  Array.isArray(actualValue) ? actualValue : [actualValue],
                )}
              />
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
