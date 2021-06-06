import { DelayHandlingButtonContainerProps } from "@visian/ui-shared";

export interface MenuProps extends DelayHandlingButtonContainerProps {
  onOpenShortcutPopUp?: () => void;
}
