import { ColorParam, Modal, NumberParam } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useStore } from "../../../app/root-store";

import { LayerSettingsProps } from "./layer-settings.props";

export const LayerSettings = observer<LayerSettingsProps>(
  ({ layer, ...rest }) => {
    const store = useStore();

    return (
      <Modal {...rest} labelTx="layer-settings" onReset={layer.resetSettings}>
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
