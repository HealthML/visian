import {
  Modal,
  PointerButton,
  preventDefault,
  SliderField,
  Switch,
  Tool,
  Toolbar as GenericToolbar,
  useModalPosition,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { ToolType } from "../../../models";

// Styled Components
const StyledToolbar = styled(GenericToolbar)`
  margin-bottom: 16px;
`;

const SpacedSliderField = styled(SliderField)`
  margin-bottom: 14px;
`;

const BrushModal = styled(Modal)`
  padding-bottom: 0px;
`;

// Menu Items
const adaptiveBrushSizeSwitchItems = [
  { labelTx: "on", value: true },
  { labelTx: "off", value: false },
];

export const Toolbar: React.FC = observer(() => {
  const store = useStore();

  // Menu Toggling
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Menu Positioning
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);
  const modalPosition = useModalPosition(buttonRef, "right", isModalOpen);

  const activeTool = store?.editor.tools.activeTool;
  const setActiveTool = useCallback(
    (
      value: string | number | undefined,
      event: React.PointerEvent<HTMLButtonElement>,
    ) => {
      if (
        event.button === PointerButton.RMB ||
        store?.editor.tools.activeTool === value
      ) {
        event.preventDefault();
        event.stopPropagation();
        setIsModalOpen(
          store?.editor.tools.activeTool !== value || !isModalOpen,
        );
      }

      store?.editor.tools.setActiveTool(value as ToolType);
    },
    [isModalOpen, store],
  );
  const clearSlice = useCallback(
    (_value: string | number | undefined, event: React.PointerEvent) => {
      if (event.button !== PointerButton.LMB) return;
      store?.editor.tools.clearSlice();
    },
    [store],
  );
  const setBrushSize = useCallback(
    (value: number) => {
      store?.editor.tools.setBrushSizePixels(value, true);
    },
    [store],
  );

  return (
    <StyledToolbar>
      <Tool
        icon="moveTool"
        tooltipTx="navigation-tool"
        activeTool={activeTool}
        value={ToolType.Navigate}
        onPress={setActiveTool}
        onContextMenu={preventDefault}
      />
      <Tool
        icon="crosshair"
        tooltipTx="crosshair-tool"
        activeTool={activeTool}
        value={ToolType.Crosshair}
        isDisabled={
          store?.editor.image && store.editor.image.dimensionality < 3
        }
        onPress={setActiveTool}
        onContextMenu={preventDefault}
      />
      <Tool
        icon="pixelBrush"
        tooltipTx="pixel-brush"
        showTooltip={!isModalOpen || activeTool !== ToolType.Brush}
        activeTool={activeTool}
        value={ToolType.Brush}
        ref={activeTool === ToolType.Brush ? setButtonRef : undefined}
        onPress={setActiveTool}
        onContextMenu={preventDefault}
      />
      <Tool
        icon="magicBrush"
        tooltipTx="smart-brush"
        showTooltip={!isModalOpen || activeTool !== ToolType.SmartBrush}
        activeTool={activeTool}
        value={ToolType.SmartBrush}
        ref={activeTool === ToolType.SmartBrush ? setButtonRef : undefined}
        onPress={setActiveTool}
        onContextMenu={preventDefault}
      />
      <Tool
        icon="erase"
        tooltipTx="pixel-eraser"
        showTooltip={!isModalOpen || activeTool !== ToolType.Eraser}
        activeTool={activeTool}
        value={ToolType.Eraser}
        ref={activeTool === ToolType.Eraser ? setButtonRef : undefined}
        onPress={setActiveTool}
        onContextMenu={preventDefault}
      />
      <Tool
        icon="trash"
        tooltipTx="clear-slice"
        onPress={clearSlice}
        onContextMenu={preventDefault}
      />
      <BrushModal
        style={modalPosition}
        isOpen={
          isModalOpen &&
          activeTool !== ToolType.Navigate &&
          activeTool !== ToolType.Crosshair
        }
        onOutsidePress={closeModal}
        labelTx={
          activeTool === ToolType.SmartBrush
            ? "smart-brush-settings"
            : "brush-settings"
        }
      >
        <Switch
          labelTx="lock-brush-size"
          items={adaptiveBrushSizeSwitchItems}
          value={Boolean(store?.editor.tools.isBrushSizeLocked)}
          onChange={store?.editor.tools.lockBrushSize}
        />
        <SpacedSliderField
          labelTx="brush-size"
          showValueLabel
          min={0}
          max={250}
          scaleType="quadratic"
          value={store?.editor.tools.brushSizePixels}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={setBrushSize as any}
        />
        {activeTool === ToolType.SmartBrush && (
          <>
            <SpacedSliderField
              labelTx="seed-threshold"
              showValueLabel
              min={1}
              max={20}
              value={store?.editor.tools.smartBrushSeedThreshold}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={store?.editor.tools.setSmartBrushSeedThreshold as any}
            />
            <SpacedSliderField
              labelTx="neighbor-threshold"
              showValueLabel
              min={1}
              max={20}
              value={store?.editor.tools.smartBrushNeighborThreshold}
              onChange={
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                store?.editor.tools.setSmartBrushNeighborThreshold as any
              }
            />
          </>
        )}
      </BrushModal>
    </StyledToolbar>
  );
});
