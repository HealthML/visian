import {
  IconType,
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
import { NumberParameter, ToolName } from "../../../models";

// TODO: Potentially move this to the tool definitions as well?
const iconMap: Record<ToolName, IconType> = {
  "navigation-tool": "navigationTool",
  "crosshair-tool": "crosshair",
  "pixel-brush": "pixelBrush",
  "pixel-eraser": "eraser",
  "smart-brush": "magicBrush",
  "smart-eraser": "eraser",
  "outline-tool": "outline",
  "outline-eraser": "outline",
  "clear-slice": "trash",
  "clear-image": "trash",
};

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

  const activeTool = store?.editor.activeDocument?.tools.activeTool;
  const activeToolName = activeTool?.name;
  const setActiveTool = useCallback(
    (
      value: string | number | undefined,
      event: React.PointerEvent<HTMLButtonElement>,
    ) => {
      if (
        event.button === PointerButton.RMB ||
        store?.editor.activeDocument?.tools.activeTool === value
      ) {
        event.preventDefault();
        event.stopPropagation();
        setIsModalOpen(
          store?.editor.activeDocument?.tools.activeTool !== value ||
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

  return (
    <StyledToolbar ref={ref}>
      {store?.editor.activeDocument?.tools.toolGroups.map(
        ({ activeTool: tool }) => (
          <Tool
            icon={iconMap[tool.name]}
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
        // TODO: Reset
      >
        {activeTool?.isBrush && (
          <>
            <Switch
              labelTx="lock-brush-size"
              items={adaptiveBrushSizeSwitchItems}
              value={Boolean(
                store?.editor.activeDocument?.tools.useAdaptiveBrushSize,
              )}
              onChange={
                store?.editor.activeDocument?.tools.setUseAdaptiveBrushSize
              }
            />
            <SpacedSliderField
              labelTx="brush-size"
              min={0}
              max={250}
              scaleType="quadratic"
              value={store?.editor.activeDocument?.tools.brushSize}
              onChange={setBrushSize}
            />
          </>
        )}

        {activeTool &&
          // TODO: Extract param rendering
          Object.values(activeTool.params).map((param) =>
            param.kind === "number" ? (
              <SpacedSliderField
                labelTx={param.labelTx}
                label={param.label}
                min={(param as NumberParameter).min}
                max={(param as NumberParameter).max}
                value={(param as NumberParameter).value}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(param as NumberParameter).setValue as any}
              />
            ) : // TODO: Render UI for other param kinds
            null,
          )}
      </BrushModal>
    </StyledToolbar>
  );
});
