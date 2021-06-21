import {
  BooleanParam,
  Modal,
  NumberParam,
  Param,
  PointerButton,
  preventDefault,
  Tool,
  Toolbar as GenericToolbar,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { ToolName } from "../../../models";

// Styled Components
const StyledToolbar = styled(GenericToolbar)`
  margin-bottom: 16px;
`;

const BrushModal = styled(Modal)`
  padding-bottom: 0px;
`;

export const Toolbar: React.FC = observer(() => {
  const store = useStore();

  // Ref Management
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    store?.setRef("toolbar", ref);

    return () => {
      store?.setRef("toolbar");
    };
  }, [store, ref]);

  // Menu Toggling
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = useCallback(
    (value?: unknown) => {
      if (
        !value ||
        store?.editor.activeDocument?.tools.activeTool?.name === value
      ) {
        setIsModalOpen(false);
      }
    },
    [store],
  );

  // Menu Positioning
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  const activeTool = store?.editor.activeDocument?.tools.activeTool;
  const activeToolName = activeTool?.name;
  const setActiveTool = useCallback(
    (
      value: string | number | undefined,
      event: React.PointerEvent<HTMLButtonElement>,
    ) => {
      const previousTool = store?.editor.activeDocument?.tools.activeTool?.name;
      store?.editor.activeDocument?.tools.setActiveTool(value as ToolName);

      if (
        (event.button === PointerButton.RMB || previousTool === value) &&
        store?.editor.activeDocument?.tools.activeTool?.name === value
      ) {
        setIsModalOpen(previousTool !== value || !isModalOpen);
      }
    },
    [isModalOpen, store],
  );
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

  return (
    <StyledToolbar ref={ref}>
      {store?.editor.activeDocument?.tools.toolGroups.map(
        ({ activeTool: tool }, index) =>
          tool.canActivate() && (
            <Tool
              key={index}
              icon={tool.icon}
              isDisabled={
                tool.name === "crosshair-tool" &&
                !store?.editor.activeDocument?.has3DLayers
              }
              tooltipTx={tool.labelTx}
              tooltip={tool.label}
              activeTool={activeToolName}
              value={tool.name}
              showTooltip={!isModalOpen || activeToolName !== tool.name}
              ref={activeToolName === tool.name ? setButtonRef : undefined}
              onPress={setActiveTool}
              onContextMenu={preventDefault}
            />
          ),
      )}
      <BrushModal
        isOpen={Boolean(
          isModalOpen &&
            activeTool &&
            (activeTool.isBrush || Object.keys(activeTool.params).length),
        )}
        labelTx={activeTool?.labelTx}
        label={activeTool?.label}
        value={activeTool?.name}
        parentElement={buttonRef}
        position="right"
        onOutsidePress={closeModal}
        onReset={store?.editor.activeDocument?.tools.resetActiveToolSetings}
      >
        {activeTool?.isBrush &&
          activeTool?.name !== "bounded-smart-brush" &&
          activeTool?.name !== "bounded-smart-eraser" && (
            <>
              <BooleanParam
                labelTx="adaptive-brush-size"
                value={Boolean(
                  store?.editor.activeDocument?.tools.useAdaptiveBrushSize,
                )}
                setValue={
                  store?.editor.activeDocument?.tools.setUseAdaptiveBrushSize
                }
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
            max={20}
            stepSize={1}
            value={store?.editor.activeDocument?.tools.smartBrushThreshold}
            setValue={setSmartBrushThreshold}
          />
        )}

        {activeTool &&
          Object.values(activeTool.params).map((param) => (
            <Param parameter={param} key={param.name} />
          ))}
      </BrushModal>
    </StyledToolbar>
  );
});
