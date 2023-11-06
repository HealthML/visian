import { IconType } from "../icon";

export interface ToggleSliderProps {
  primaryColor: string;
  secondaryColor: string;
  primaryBorderColor?: string;
  secondaryBorderColor?: string;
  startValue?: boolean;
  icon?: IconType;
  sliderTrackWidth?: number;
  sliderTrackHeight?: number;
  sliderHandleDiameter?: number;
  borderWidth?: number;
  transitionTime?: number;
  flip?: boolean;
  onToggle?: () => void;
  tooltip?: string;
  tooltiptx?: string;
}
