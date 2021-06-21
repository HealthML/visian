import {
  ColorParam,
  Divider,
  Modal,
  NumberParam,
  RedButtonParam,
  useForceUpdate,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useLayoutEffect } from "react";

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

    const { t } = useTranslation();
    const deleteLayer = useCallback(() => {
      if (
        // eslint-disable-next-line no-alert
        window.confirm(t("delete-layer-confirmation", { layer: layer.title }))
      ) {
        layer.delete();
      }
    }, [layer, t]);

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
        <Divider />
        <RedButtonParam labelTx="delete-layer" handlePress={deleteLayer} />
      </Modal>
    );
  },
);
