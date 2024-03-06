import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { ToggleSliderProps } from "./slide-toggle.props";
import { setFullOpacity } from "./utils";
import { useTranslation } from "../../i18n";
import { color as getColor, theme } from "../../theme";
import { Icon } from "../icon";

const SliderContainer = styled.div<{
  sliderHandleDiameter?: number;
  sliderTrackWidth?: number;
  additionalPadding?: number;
}>`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: ${({ sliderHandleDiameter, sliderTrackWidth, additionalPadding }) =>
    `0 ${
      ((sliderHandleDiameter || 20) +
        (sliderTrackWidth || 30) +
        (additionalPadding || 0)) /
      5
    }px`};
`;

const SliderTrack = styled.div<{
  color?: string;
  sliderTrackWidth?: number;
  sliderTrackHeight?: number;
}>`
  width: 30px;
  height: 15px;
  border-radius: 15px;
  background: ${({ color }) => color || "#4caf50"};
  position: relative;
  margin-right: 10px;
`;

const SliderHandle = styled.div<{
  isOn: boolean;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  sliderHandleDiameter?: number;
  sliderTrackWidth?: number;
  transitionTime?: number;
  flip?: boolean;
}>`
  width: ${({ sliderHandleDiameter }) => sliderHandleDiameter || 20}px;
  height: ${({ sliderHandleDiameter }) => sliderHandleDiameter || 20}px;
  border-radius: 50%;
  background: ${({ color }) => setFullOpacity(color) || getColor("gray")};
  border: ${({ borderWidth }) => borderWidth || "2px"} solid
    ${({ borderColor }) => borderColor};
  position: absolute;
  top: 50%;
  left: ${({ isOn, flip, sliderHandleDiameter, sliderTrackWidth }) =>
    isOn
      ? flip
        ? `${(sliderHandleDiameter || 20) / -10}px`
        : `${(sliderHandleDiameter || 20) / 20 + (sliderTrackWidth || 30)}px`
      : flip
      ? `${(sliderHandleDiameter || 20) / 20 + (sliderTrackWidth || 30)}px`
      : `${(sliderHandleDiameter || 20) / 10}px`};
  transform: translate(-50%, -50%);
  transition: ${({ transitionTime }) => transitionTime || "0.2s"};
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ToggleSlider: React.FC<ToggleSliderProps> = ({
  startValue,
  onToggle,
  tooltip,
  tooltiptx,
  flip,
  activeColor: primaryColor,
  inactiveColor: secondaryColor,
  activeBorderColor: primaryBorderColor,
  inactiveBorderColor: secondaryBorderColor,
  icon,
  iconColor,
  sliderTrackWidth,
  sliderTrackHeight,
  sliderHandleDiameter,
  handleBorderWidth,
  transitionTime,
  padding,
  isDisabled = false,
}) => {
  const [isOn, setIsOn] = useState(startValue || false);
  const [color, setColor] = useState(isOn ? primaryColor : secondaryColor);
  const [borderColor, setBorderColor] = useState(
    isOn
      ? primaryBorderColor || primaryColor
      : secondaryBorderColor || secondaryColor,
  );
  const switchColor = useCallback(() => {
    if (!isDisabled) {
      if (color === secondaryColor) {
        setColor(primaryColor);
        setBorderColor(primaryBorderColor || primaryColor);
      } else {
        setColor(secondaryColor);
        setBorderColor(secondaryBorderColor || secondaryColor);
      }
    }
  }, [
    isDisabled,
    color,
    secondaryColor,
    primaryColor,
    primaryBorderColor,
    secondaryBorderColor,
  ]);

  const handleToggle = useCallback(() => {
    if (!isDisabled) {
      switchColor();
      setIsOn((prevIsOn) => !prevIsOn);
      onToggle?.();
    }
  }, [isDisabled, onToggle, switchColor]);

  useEffect(() => {
    if (isDisabled) {
      setIsOn(false);
      setColor(theme.colors["redSheet"]);
      setBorderColor(theme.colors["sheetBorder"]);
    } else {
      setIsOn(startValue || false);
      setColor(isOn ? primaryColor : secondaryColor);
      setBorderColor(
        isOn
          ? primaryBorderColor || primaryColor
          : secondaryBorderColor || secondaryColor,
      );
    }
  }, [
    isDisabled,
    isOn,
    primaryBorderColor,
    primaryColor,
    secondaryBorderColor,
    secondaryColor,
    startValue,
  ]);

  const { t } = useTranslation();

  return (
    <SliderContainer
      onClick={handleToggle}
      title={isDisabled ? "disabled" : t(tooltiptx) || tooltip}
      sliderHandleDiameter={sliderHandleDiameter}
      sliderTrackWidth={sliderTrackWidth}
      additionalPadding={padding}
    >
      <SliderTrack
        color={color}
        sliderTrackWidth={sliderTrackWidth}
        sliderTrackHeight={sliderTrackHeight}
      >
        <SliderHandle
          isOn={isOn}
          color={color}
          borderColor={borderColor}
          borderWidth={handleBorderWidth}
          sliderHandleDiameter={sliderHandleDiameter}
          sliderTrackWidth={sliderTrackWidth}
          transitionTime={transitionTime}
          flip={flip}
        >
          {icon && isOn && <Icon icon={icon} color={iconColor || "text"} />}
        </SliderHandle>
      </SliderTrack>
    </SliderContainer>
  );
};

export default ToggleSlider;
