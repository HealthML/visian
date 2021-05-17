import {
  Modal,
  PointerButton,
  preventDefault,
  SliderField,
  Switch,
  Tool,
  Toolbar as GenericToolbar,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
    (value: number | number[]) => {
      store?.editor.tools.setBrushSizePixels(value as number, true);
    },
    [store],
  );

  return (
    <StyledToolbar ref={ref}>
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
          !store?.editor.isIn3DMode || !store.editor.viewSettings.showSideViews
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
        icon="outline"
        tooltipTx="outline-tool"
        showTooltip={!isModalOpen || activeTool !== ToolType.Outline}
        activeTool={activeTool}
        value={ToolType.Outline}
        ref={activeTool === ToolType.Outline ? setButtonRef : undefined}
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
        isOpen={
          isModalOpen &&
          activeTool !== ToolType.Navigate &&
          activeTool !== ToolType.Crosshair &&
          activeTool !== ToolType.Outline
        }
        labelTx={
          activeTool === ToolType.SmartBrush
            ? "smart-brush-settings"
            : "brush-settings"
        }
        parentElement={buttonRef}
        position="right"
        onOutsidePress={closeModal}
        onReset={
          activeTool === ToolType.SmartBrush
            ? store?.editor.tools.resetSmartBrush
            : store?.editor.tools.resetBrushSize
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
          min={0}
          max={250}
          scaleType="quadratic"
          value={store?.editor.tools.brushSizePixels}
          onChange={setBrushSize}
        />
        {activeTool === ToolType.SmartBrush && (
          <>
            <SpacedSliderField
              labelTx="seed-threshold"
              min={1}
              max={20}
              value={store?.editor.tools.smartBrushSeedThreshold}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={store?.editor.tools.setSmartBrushSeedThreshold as any}
            />
            <SpacedSliderField
              labelTx="neighbor-threshold"
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
