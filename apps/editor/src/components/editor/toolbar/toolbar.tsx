import {
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
import { ToolSettings } from "./tool-settings";

// Styled Components
const StyledToolbar = styled(GenericToolbar)`
  margin-bottom: 16px;
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
      <ToolSettings
        activeToolRef={buttonRef}
        isOpen={isModalOpen}
        onDismiss={closeModal}
      />
    </StyledToolbar>
  );
});
