import { IconType } from "../icon";

export interface ToggleSliderProps {
  startValue?: boolean;
  icon?: IconType;
  primaryColor: string;
  secondaryColor: string;
  primaryBorderColor: string;
  secondaryBorderColor: string;
  sliderTrackWidth?: number;
  sliderTrackHeight?: number;
  sliderHandleDiameter?: number;
  borderWidth?: number;
  transitionTime?: number;
  flip?: boolean;
}
