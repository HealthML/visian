import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { useTranslation } from "../../i18n";
import { Icon } from "../icon";
import { ToggleSliderProps } from "./slide-toggle.props";

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
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
  transitionTime?: number;
  flip?: boolean;
}>`
  width: ${({ sliderHandleDiameter }) => sliderHandleDiameter || "20px"};
  height: ${({ sliderHandleDiameter }) => sliderHandleDiameter || "20px"};
  border-radius: 50%;
  background: ${({ color }) => color};
  border: ${({ borderWidth }) => borderWidth || "2px"} solid
    ${({ borderColor }) => borderColor};
  position: absolute;
  top: -4px;
  left: ${({ isOn, flip }) =>
    isOn ? (flip ? "-1.0px" : "15px") : flip ? "15px" : "-1.0px"};
  transition: ${({ transitionTime }) => transitionTime || "0.2s"};
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);

  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ToggleSlider: React.FC<ToggleSliderProps> = ({
  primaryColor,
  secondaryColor,
  primaryBorderColor,
  secondaryBorderColor,
  startValue,
  icon,
  sliderTrackWidth,
  sliderTrackHeight,
  sliderHandleDiameter,
  borderWidth,
  transitionTime,
  flip,
  onToggle,
  tooltip,
  tooltiptx,
}) => {
  const [isOn, setIsOn] = useState(startValue || false);
  const [color, setColor] = useState(isOn ? primaryColor : secondaryColor);
  const [borderColor, setBorderColor] = useState(
    isOn
      ? primaryBorderColor || primaryColor
      : secondaryBorderColor || secondaryColor,
  );
  const switchColor = useCallback(() => {
    if (color === secondaryColor) {
      setColor(primaryColor);
      setBorderColor(primaryBorderColor || primaryColor);
    } else {
      setColor(secondaryColor);
      setBorderColor(secondaryBorderColor || secondaryColor);
    }
  }, [
    color,
    secondaryColor,
    primaryColor,
    primaryBorderColor,
    secondaryBorderColor,
  ]);

  const handleToggle = useCallback(() => {
    switchColor();
    setIsOn((prevIsOn) => !prevIsOn);
    onToggle?.();
  }, [onToggle, switchColor]);

  const { t } = useTranslation();

  return (
    <SliderContainer onClick={handleToggle} title={t(tooltiptx) || tooltip}>
      <SliderTrack
        color={color}
        sliderTrackWidth={sliderTrackWidth}
        sliderTrackHeight={sliderTrackHeight}
      >
        <SliderHandle
          isOn={isOn}
          color={color}
          borderColor={borderColor}
          borderWidth={borderWidth}
          sliderHandleDiameter={sliderHandleDiameter}
          transitionTime={transitionTime}
          flip={flip}
        >
          {icon && isOn && <Icon icon={icon} color={borderColor} />}
        </SliderHandle>
      </SliderTrack>
    </SliderContainer>
  );
};

export default ToggleSlider;
