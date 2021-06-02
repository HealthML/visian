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
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Menu Positioning
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  const activeTool = store?.editor.activeDocument?.tools.activeTool;
  const activeToolName = activeTool?.name;
  const setActiveTool = useCallback(
    (
      value: string | number | undefined,
      event: React.PointerEvent<HTMLButtonElement>,
    ) => {
      if (
        event.button === PointerButton.RMB ||
        store?.editor.activeDocument?.tools.activeTool?.name === value
      ) {
        event.preventDefault();
        event.stopPropagation();
        setIsModalOpen(
          store?.editor.activeDocument?.tools.activeTool?.name !== value ||
            !isModalOpen,
        );
      }

      store?.editor.activeDocument?.tools.setActiveTool(value as ToolName);
    },
    [isModalOpen, store],
  );
  const setBrushSize = useCallback(
    (value: number | number[]) => {
      store?.editor.activeDocument?.tools.setBrushSize(value as number, true);
    },
    [store],
  );

  // The crosshair cannot be used for 2D scans
  // TODO: This logic should probably be moved into the model
  if (
    activeToolName === "crosshair-tool" &&
    !store?.editor.activeDocument?.has3DLayers
  ) {
    store?.editor.activeDocument?.tools.setActiveTool();
  }

  return (
    <StyledToolbar ref={ref}>
      {store?.editor.activeDocument?.tools.toolGroups.map(
        ({ activeTool: tool }, index) => (
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
        parentElement={buttonRef}
        position="right"
        onOutsidePress={closeModal}
        onReset={store?.editor.activeDocument?.tools.resetActiveToolSetings}
      >
        {activeTool?.isBrush && (
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

        {activeTool &&
          Object.values(activeTool.params).map((param) => (
            <Param {...param} key={param.name} />
          ))}
      </BrushModal>
    </StyledToolbar>
  );
});
