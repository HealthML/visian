import { ColorParam, Modal } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";

import { LayerSettingsProps } from "./layer-settings.props";

export const LayerSettings = observer<LayerSettingsProps>(
  ({ layer, ...rest }) => (
    <Modal {...rest} labelTx="color-panel">
      <ColorParam value={layer.color} setValue={layer.setColor} isFirst />
    </Modal>
  ),
);
