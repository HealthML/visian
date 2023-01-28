import {
  BooleanParam,
  Modal,
  ModalProps,
  NumberParam,
  Param,
  Theme,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import styled, { useTheme } from "styled-components";

import { useStore } from "../../../app/root-store";

// Styled Components
const ToolSettingsModal = styled(Modal)`
  padding-bottom: 0px;
`;

export const ToolSettings: React.FC<
  {
    activeToolRef: HTMLElement | null;
    isOpen?: boolean;
    onDismiss?: () => void;
  } & ModalProps
> = observer(({ activeToolRef, isOpen, onDismiss, ...rest }) => {
  const store = useStore();

  const activeTool = store?.editor.activeDocument?.tools.activeTool;

  const setBrushSize = useCallback(
    (value: number | number[]) => {
      store?.editor.activeDocument?.tools.setBrushSize(value as number, true);
    },
    [store],
  );
  const setSmartBrushThreshold = useCallback(
    (value: number | number[]) => {
      store?.editor.activeDocument?.tools.setSmartBrushThreshold(
        value as number,
      );
    },
    [store],
  );
  const setBoundedSmartBrushRadius = useCallback(
    (value: number | number[]) => {
      store?.editor.activeDocument?.tools.setBoundedSmartBrushRadius(
        value as number,
        true,
      );
    },
    [store],
  );

  const modalZ = (useTheme() as Theme).zIndices.modal + 1;
  return (
    <ToolSettingsModal
      {...rest}
      isOpen={Boolean(
        isOpen &&
          activeTool &&
          (activeTool.isBrush ||
            Object.keys(activeTool.params).length ||
            activeTool.name === "plane-tool"),
      )}
      labelTx={activeTool?.labelTx}
      label={activeTool?.label}
      value={activeTool?.name}
      anchor={activeToolRef}
      position="right"
      baseZIndex={modalZ}
      onOutsidePress={onDismiss}
      onReset={
        store?.editor.activeDocument?.tools.activeTool?.name === "plane-tool"
          ? store?.editor.activeDocument?.viewport3D.resetClippingPlane
          : store?.editor.activeDocument?.tools.resetActiveToolSetings
      }
    >
      {activeTool?.isBrush &&
        activeTool?.name !== "bounded-smart-brush" &&
        activeTool?.name !== "bounded-smart-eraser" &&
        activeTool?.name !== "smart-brush-3d" && (
          <>
            <BooleanParam
              labelTx="adaptive-brush-size"
              value={Boolean(
                store?.editor.activeDocument?.tools.useAdaptiveBrushSize,
              )}
              setValue={
                store?.editor.activeDocument?.tools.setUseAdaptiveBrushSize
              }
              infoTx="info-adaptive-brush-size"
            />
            <NumberParam
              labelTx="brush-size"
              min={0}
              max={250}
              scaleType="quadratic"
              value={store?.editor.activeDocument?.tools.brushSize}
              setValue={setBrushSize}
            />
          </>
        )}
      {(activeTool?.name === "bounded-smart-brush" ||
        activeTool?.name === "bounded-smart-eraser") && (
        <NumberParam
          labelTx="box-radius"
          min={3}
          max={40}
          stepSize={1}
          value={store?.editor.activeDocument?.tools.boundedSmartBrushRadius}
          setValue={setBoundedSmartBrushRadius}
        />
      )}
      {activeTool?.isSmartBrush && (
        <NumberParam
          labelTx="threshold"
          min={0}
          max={40}
          extendBeyondMinMax
          stepSize={1}
          value={store?.editor.activeDocument?.tools.smartBrushThreshold}
          setValue={setSmartBrushThreshold}
        />
      )}
      {activeTool?.name === "plane-tool" && (
        <>
          <BooleanParam
            labelTx="enable-plane"
            value={Boolean(
              store?.editor.activeDocument?.viewport3D.useClippingPlane,
            )}
            setValue={
              store?.editor.activeDocument?.viewport3D.setUseClippingPlane
            }
          />
          <BooleanParam
            labelTx="render-plane"
            value={Boolean(
              store?.editor.activeDocument?.viewport3D
                .shouldClippingPlaneRender,
            )}
            setValue={
              store?.editor.activeDocument?.viewport3D
                .setShouldClippingPlaneRender
            }
          />
          <BooleanParam
            labelTx="render-plane-annotations"
            value={Boolean(
              store?.editor.activeDocument?.viewport3D
                .shouldClippingPlaneShowAnnotations,
            )}
            setValue={
              store?.editor.activeDocument?.viewport3D
                .setShouldClippingPlaneShowAnnotations
            }
          />
        </>
      )}

      {activeTool &&
        Object.values(activeTool.params).map((param) => (
          <Param parameter={param} key={param.name} />
        ))}
    </ToolSettingsModal>
  );
});
