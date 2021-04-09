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
import { SliderRangeSelectionProps, ThumbProps } from "./slider.props";
import { SliderStylingSettings, SliderVerticalitySettings } from "./types";

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
