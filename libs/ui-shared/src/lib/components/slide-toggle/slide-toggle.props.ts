import { IconType } from "../icon";

export interface ToggleSliderProps {
  startValue?: boolean;
  onToggle?: () => void;
  tooltip?: string;
  tooltiptx: string;
  flip?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  activeBorderColor?: string;
  inactiveBorderColor?: string;
  icon?: IconType;
  iconColor?: string;
  sliderTrackWidth?: number;
  sliderTrackHeight?: number;
  sliderHandleDiameter?: number;
  handleBorderWidth?: number;
  transitionTime?: number;
  padding?: number;
  isDisabled?: boolean;
}
