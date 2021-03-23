import React, {
  PointerEvent as ReactPointerEvent,
  useCallback,
  useRef,
} from "react";
import styled from "styled-components";

import { SliderProps } from "./slider.props";
import {
  color,
  computeStyleValue,
  lineHeight,
  scaleMetric,
  size,
  ThemeProps,
} from "../../theme";
import { pointerToSliderValue, useDrag, valueToSliderPos } from "./utils";

interface VerticalProps {
  isVertical?: boolean;
}

const Container = styled.div<VerticalProps>`
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

const Track = styled.div<VerticalProps>`
  background-color: ${color("lightGray")};
  flex: 1;
  height: ${(props) =>
    props.isVertical ? "unset" : lineHeight("sliderTrack")};
  width: ${(props) => (props.isVertical ? lineHeight("sliderTrack") : "unset")};
`;

interface ThumbProps extends VerticalProps {
  position: string;
}

const Thumb = styled.div.attrs<ThumbProps>((props) => {
  const thumbPositionAcross = computeStyleValue<ThemeProps>(
    [size("sliderHeight"), size("sliderThumbHeight")],
    (sliderHeight, thumbHeight) => (sliderHeight - thumbHeight) / 2,
  )(props);

  return {
    style: {
      top: props.isVertical ? props.position : thumbPositionAcross,
      left: props.isVertical ? thumbPositionAcross : props.position,
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
          min,
          max,
          stepSize,
          roundMethod,
          isInverted,
          isVertical,
        }),
      );
    },
    [isInverted, max, min, onChange, roundMethod, stepSize, isVertical],
  );

  const dragListeners = useDrag(updateValue, updateValue);

  const actualValue = value === undefined ? defaultValue || 0 : value;
  const thumbPos = valueToSliderPos(actualValue, {
    min,
    max,
    stepSize,
    roundMethod,
    isInverted,
  });

  return (
    <Container
      {...rest}
      {...(onChange ? dragListeners : {})}
      isVertical={isVertical}
      ref={sliderRef}
    >
      <Track isVertical={isVertical} />
      <Thumb isVertical={isVertical} position={thumbPos} />
    </Container>
  );
};

export default Slider;
