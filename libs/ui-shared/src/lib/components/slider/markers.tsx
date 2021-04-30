import React from "react";
import styled, { css } from "styled-components";

import {
  color,
  computeStyleValue,
  scaleMetric,
  size,
  space,
  Theme,
  ThemeProps,
} from "../../theme";
import { MarkerProps, RangeMarkerProps } from "./slider.props";

export const SliderMarker = styled.div.attrs<MarkerProps>((props) => {
  const markerPosition = `${props.position * 100}%`;
  const style: React.CSSProperties = props.isVertical
    ? {
        right: space("sliderMarkerMargin")(props),
        top: markerPosition,
      }
    : {
        bottom: space("sliderMarkerMargin")(props),
        left: markerPosition,
      };

  if (props.color) {
    style.backgroundColor = color(props.color as keyof Theme["colors"])(
      props,
    ) as string;
  }
  return {
    style,
  };
})<MarkerProps>`
  background-color: ${color("text")};
  border: none;
  border-radius: ${(props) =>
    scaleMetric(size("sliderMarkerWidth")(props), 0.5)};
  height: ${(props) =>
    props.isVertical ? size("sliderMarkerWidth") : size("sliderMarkerHeight")};
  margin: ${(props) => {
    const margin = scaleMetric(size("sliderMarkerWidth")(props), -0.5);
    return props.isVertical ? `${margin} 0 0 0` : `0 0 0 ${margin}`;
  }};
  opacity: 0.6;
  position: absolute;
  transition: opacity 0.3s;
  width: ${(props) =>
    props.isVertical ? size("sliderMarkerHeight") : size("sliderMarkerWidth")};
  z-index: 9;

  ${(props) =>
    props.isActive &&
    css`
      opacity: 1;
    `}
`;

const SliderMarkerRange = styled.div.attrs<RangeMarkerProps>((props) => {
  const startPosition = `${props.from * 100}%`;
  const endPosition = `${(1 - props.to) * 100}%`;
  const margin = computeStyleValue<ThemeProps>(
    [
      space("sliderMarkerMargin"),
      size("sliderMarkerHeight"),
      size("sliderMarkerRangeHeight"),
    ],
    (sliderMarkerMargin, sliderMarkerHeight, sliderMarkerRangeHeight) =>
      sliderMarkerMargin + (sliderMarkerHeight - sliderMarkerRangeHeight),
  )(props);

  const style: React.CSSProperties = props.isVertical
    ? {
        right: margin,
        top: startPosition,
        bottom: endPosition,
      }
    : {
        bottom: space("sliderMarkerMargin")(props),
        left: startPosition,
        right: endPosition,
      };

  if (props.color) {
    style.backgroundColor = color(props.color as keyof Theme["colors"])(
      props,
    ) as string;
  }
  return {
    style,
  };
})<RangeMarkerProps>`
  background-color: ${color("text")};
  border: none;
  opacity: 0.2;
  position: absolute;
  transition: opacity 0.3s;
  z-index: 8;

  ${(props) =>
    props.isVertical
      ? css`
          width: ${size("sliderMarkerRangeHeight")};
        `
      : css`
          height: ${size("sliderMarkerRangeHeight")};
        `};

  ${(props) =>
    props.isActive &&
    css`
      opacity: 0.6;
    `}
`;

export const SliderRangeMarker: React.FC<RangeMarkerProps> = ({
  from,
  to,
  ...rest
}) => (
  <>
    <SliderMarkerRange
      {...rest}
      from={Math.min(from, to)}
      to={Math.max(from, to)}
    />
    <SliderMarker {...rest} position={from} />
    <SliderMarker {...rest} position={to} />
  </>
);
