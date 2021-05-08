import type { ModalProps } from "@visian/ui-shared";
import type { VolumeRendererModel } from "../../models";

export interface SettingsProps extends ModalProps {
  volumeRendererModel: VolumeRendererModel;

  parentElement?: HTMLElement | null;
}
