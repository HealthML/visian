import {
  ColorParam,
  Modal,
  NumberParam,
  useForceUpdate,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useLayoutEffect } from "react";
import { useStore } from "../../../app/root-store";

import { LayerSettingsProps } from "./layer-settings.props";

export const LayerSettings = observer<LayerSettingsProps>(
  ({ layer, isOpen, ...rest }) => {
    const store = useStore();

    // This is required to force an update when the view mode changes
    // (otherwise the layer settings stay fixed in place when switching the view mode)
    const viewMode = store?.editor.activeDocument?.viewSettings.viewMode;
    const forceUpdate = useForceUpdate();
    useLayoutEffect(() => {
      if (isOpen) forceUpdate();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode]);

    return (
      <Modal
        {...rest}
        isOpen={isOpen}
        labelTx="layer-settings"
        onReset={layer.resetSettings}
      >
        <NumberParam
          labelTx="opacity"
          value={layer.opacity}
          setValue={layer.setOpacity}
          scaleType={
            store?.editor.activeDocument?.viewSettings.viewMode === "3D"
              ? "quadratic"
              : "linear"
          }
        />
        <ColorParam value={layer.color} setValue={layer.setColor} />
      </Modal>
    );
  },
);
