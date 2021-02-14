import React, { useCallback, useRef, useState } from "react";
import styled from "styled-components";

import { SliderProps } from ".";
import {
  color,
  lineHeight,
  parseNumberFromMetric,
  parseUnitFromMetric,
  scaleMetric,
  size,
} from "../../theme";
import { pointerToSliderValue, useDrag, valueToSliderPos } from "./utils";

interface VerticalProps {
  vertical?: boolean;
}

const Container = styled.div<VerticalProps>`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: ${(props) => (props.vertical ? "100%" : size("sliderHeight"))};
  position: relative;
  touch-action: none;
  user-select: none;
  width: ${(props) => (props.vertical ? size("sliderHeight") : "100%")};
  flex-direction: ${(props) => (props.vertical ? "column" : "row")};
`;

const Track = styled.div<VerticalProps>`
  background-color: ${color("lightGray")};
  flex: 1;
  height: ${(props) => (props.vertical ? "unset" : lineHeight("sliderTrack"))};
  width: ${(props) => (props.vertical ? lineHeight("sliderTrack") : "unset")};
`;

interface ThumbProps extends VerticalProps {
  position: string;
}

const Thumb = styled.div<ThumbProps>`
  background-color: ${color("gray")};
  border: none;
  border-radius: ${(props) =>
    scaleMetric(size("sliderThumbWidth")(props), 0.5)};
  height: ${(props) =>
    props.vertical ? size("sliderThumbWidth") : size("sliderThumbHeight")};
  margin: ${(props) =>
      props.vertical ? scaleMetric(size("sliderThumbWidth")(props), -0.5) : "0"}
    0 0
    ${(props) =>
      props.vertical
        ? "0"
        : scaleMetric(size("sliderThumbWidth")(props), -0.5)};
  position: absolute;
  top: ${(props) =>
    props.vertical
      ? props.position
      : `${
          (parseNumberFromMetric(size("sliderHeight")(props)) -
            parseNumberFromMetric(size("sliderThumbHeight")(props))) /
          2
        }${parseUnitFromMetric(size("sliderThumbHeight")(props))}`};
  left: ${(props) =>
    props.vertical
      ? `${
          (parseNumberFromMetric(size("sliderHeight")(props)) -
            parseNumberFromMetric(size("sliderThumbHeight")(props))) /
          2
        }${parseUnitFromMetric(size("sliderThumbHeight")(props))}`
      : props.position};
  transition: background-color 0.3s;
  width: ${(props) =>
    props.vertical ? size("sliderThumbHeight") : size("sliderThumbWidth")};
  z-index: 10;
`;

/** A custom slider component built to work well with touch input. */
const Slider: React.FC<SliderProps> = (props) => {
  const {
    defaultValue,
    inverted,
    min = 0,
    max = 99,
    onChange,
    step,
    value,
    vertical,
    ...rest
  } = props;

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const updateValue = useCallback(
    (event: PointerEvent) => {
      if (!onChange || !sliderRef.current) return;
      onChange(
        pointerToSliderValue(
          event,
          sliderRef.current,
          min,
          max,
          vertical,
          inverted,
          step,
        ),
      );
    },
    [inverted, max, min, onChange, step, vertical],
  );

  const dragListeners = useDrag(updateValue, updateValue);

  const actualValue = value === undefined ? defaultValue || 0 : value;
  const thumbPos = valueToSliderPos(actualValue, min, max, inverted, step);

  return (
    <Container
      {...rest}
      {...(onChange ? dragListeners : {})}
      vertical={vertical}
      ref={sliderRef}
    >
      <Track vertical={vertical} />
      <Thumb vertical={vertical} position={thumbPos} />
    </Container>
  );
};

export default Slider;
