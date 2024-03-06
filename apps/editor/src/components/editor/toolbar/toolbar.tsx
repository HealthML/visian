import { Toolbar as GenericToolbar, InfoText } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { ToolGroup } from "./tool-group";
import { ToolSettings } from "./tool-settings";
import { useStore } from "../../../app/root-store";
import { InfoShortcuts } from "../info-shortcuts";

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
  const isModalOpen = Boolean(
    store?.editor.activeDocument?.tools.showToolSettings,
  );
  const closeModal = useCallback(
    (value?: unknown) => {
      if (
        !value ||
        store?.editor.activeDocument?.tools.activeTool?.name === value
      ) {
        store?.editor.activeDocument?.tools.setShowToolSettings(false);
      }
    },
    [store],
  );

  const activeTool = store?.editor.activeDocument?.tools.activeTool;
  const activeToolName = activeTool?.name;

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
