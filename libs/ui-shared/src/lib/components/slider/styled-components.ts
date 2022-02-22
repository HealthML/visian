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
import { coverMixin } from "../mixins";
import { Text } from "../text";
import { TextInput } from "../text-input";
import { SliderRangeSelectionProps, ThumbProps } from "./slider.props";
import { SliderVerticalitySettings } from "./types";

export const SliderContainer = styled.div<SliderVerticalitySettings>`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: ${(props) => (props.isVertical ? "100%" : size("sliderHeight"))};
  pointer-events: auto;
  position: relative;
  margin: ${(props) => {
    const margin = scaleMetric(size("sliderThumbWidth")(props), 0.5);
    return props.isVertical ? `${margin} 0` : `0 ${margin}`;
  }};
  touch-action: none;
  user-select: none;
  width: ${(props) => (props.isVertical ? size("sliderHeight") : "100%")};
  flex-direction: ${(props) => (props.isVertical ? "column" : "row")};
  -webkit-tap-highlight-color: transparent;
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
  (props) => ({
    style: props.isVertical
      ? {
          top: `${
            props.positions[props.isInverted ? props.positions.length - 1 : 0] *
            100
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
            props.positions[props.isInverted ? props.positions.length - 1 : 0] *
            100
          }%`,
          right: `${
            (1 -
              props.positions[
                props.isInverted ? 0 : props.positions.length - 1
              ]) *
            100
          }%`,
        },
  }),
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
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const RangeHandle = styled.div<{ isHovered?: boolean }>`
  background-color: ${({ isHovered }) =>
    color(isHovered ? "foreground" : "gray")};
  width: 10px;
  height: 10px;
  border-radius: 5px;
`;

export const SliderLabelRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 6px;
  align-items: center;
`;

export const SliderLabel = styled(Text)`
  font-size: ${fontSize("small")};
  line-height: 10px;
  height: 12px;
  padding-top: 2px;
`;

export const SliderValueInputWrapper = styled.div`
  display: inline-flex;
  flex: 1;
`;

export const SliderValueInput = styled(TextInput)`
  font-size: ${fontSize("small")};
  height: 12px;
  line-height: 10px;
  text-align: right;
  margin-top: -2px;
`;

export const Histogram = styled.div`
  ${coverMixin}
  align-items: flex-end;
  display: flex;
  opacity: 0.2;
`;

export const HistogramBar = styled.div`
  background-color: ${color("text")};
  flex: 1;
`;
