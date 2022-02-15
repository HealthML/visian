import {
  PointerButton,
  InfoText,
  Toolbar as GenericToolbar,
  useLongPress,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { SelfDeactivatingTool, ToolName } from "../../../models";
import { InfoShortcuts } from "../info-shortcuts";
import { ToolGroup } from "./tool-group";
import { ToolSettings } from "./tool-settings";

// Styled Components
const StyledToolbar = styled(GenericToolbar)`
  margin-bottom: 16px;
`;

const StyledInfoText = styled(InfoText)`
  margin-right: 10px;
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

  const [activeToolRef, setActiveToolRef] = useState<HTMLButtonElement | null>(
    null,
  );

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
        event.button === PointerButton.RMB &&
        store?.editor.activeDocument?.tools.activeTool?.name === value
      ) {
        setIsModalOpen(previousTool !== value || !isModalOpen);
      }
    },
    [isModalOpen, store],
  );
  const [startPress, stopPress] = useLongPress(
    useCallback(() => {
      setIsModalOpen(true);
    }, []),
  );
  const handlePress = useCallback(
    (
      value: string | number | undefined,
      event: React.PointerEvent<HTMLButtonElement>,
    ) => {
      setActiveTool(value, event);
      startPress(event);
    },
    [setActiveTool, startPress],
  );

  return (
    <StyledToolbar ref={ref}>
      {store?.editor.activeDocument?.tools.toolGroups.map(
        (toolGroup, index) => (
          <ToolGroup
            key={index}
            toolGroup={toolGroup}
            canExpand={
              !isModalOpen || activeToolName !== toolGroup.activeTool.name
            }
            showTooltip={
              !isModalOpen || activeToolName !== toolGroup.activeTool.name
            }
            ref={
              activeToolName === toolGroup.activeTool.name
                ? setActiveToolRef
                : undefined
            }
            onPress={
              toolGroup.activeTool instanceof SelfDeactivatingTool
                ? setActiveTool
                : handlePress
            }
            onRelease={
              toolGroup.activeTool instanceof SelfDeactivatingTool
                ? undefined
                : stopPress
            }
          />
        ),
      )}
      <ToolSettings
        activeToolRef={activeToolRef}
        isOpen={isModalOpen}
        onDismiss={closeModal}
        headerChildren={
          activeTool?.infoTx && (
            <StyledInfoText
              infoTx={activeTool?.infoTx}
              shortcuts={
                activeTool?.isBrush && activeTool.name !== "smart-brush-3d" ? (
                  <InfoShortcuts hotkeyGroupNames={["brush-size"]} />
                ) : undefined
              }
            />
          )
        }
      />
    </StyledToolbar>
  );
});
