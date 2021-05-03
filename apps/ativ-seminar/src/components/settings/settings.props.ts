import type { ModalProps } from "@visian/ui-shared";
import type { VolumeRendererState } from "../../models";

export interface SettingsProps extends ModalProps {
  state: VolumeRendererState;

  parentElement?: HTMLElement | null;
}
