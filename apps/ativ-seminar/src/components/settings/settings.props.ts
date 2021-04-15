import type { ModalProps } from "@visian/ui-shared";
import type { VolumeRenderer } from "../../lib/volume-renderer";

export interface SettingsProps extends ModalProps {
  renderer: VolumeRenderer;
}
