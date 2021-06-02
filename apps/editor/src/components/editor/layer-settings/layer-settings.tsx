import { ColorParam, Modal, NumberParam } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";

import { LayerSettingsProps } from "./layer-settings.props";

export const LayerSettings = observer<LayerSettingsProps>(
  ({ layer, ...rest }) => (
    <Modal {...rest} labelTx="layer-settings" onReset={layer.resetSettings}>
      <NumberParam
        labelTx="opacity"
        value={layer.opacity}
        setValue={layer.setOpacity}
      />
      <ColorParam value={layer.color} setValue={layer.setColor} />
    </Modal>
  ),
);
