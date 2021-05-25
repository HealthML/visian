import { color, InvisibleButton, Text } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";

const TopConsoleContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  justify-content: center;
  margin: 0 12px;
  overflow: hidden;
  padding-bottom: 8px;
  top: 20px;
`;

const FileTitle = styled(Text)`
  line-height: 16px;
  opacity: 0.5;
  overflow: hidden;
  margin-bottom: -8px;
  padding-bottom: 8px;
  text-overflow: ellipsis;
`;

const UnsavedChangesIndicator = styled(InvisibleButton)<{ isDirty?: boolean }>`
  background-color: ${(props) =>
    props.isDirty ? color("red") : color("green")};
  border-radius: 50%;
  cursor: ${(props) => (props.isDirty ? "pointer" : "default")};
  height: 12px;
  margin-left: 14px;
  min-width: 12px;
  opacity: 0.4;
  pointer-events: auto;
  transition: background-color 0.3s, opacity 0.3s;
  width: 12px;

  &:hover {
    opacity: 1;
  }
`;

export const TopConsole = observer(() => {
  const store = useStore();
  return store?.editor.activeDocument ? (
    <TopConsoleContainer>
      <FileTitle text={store?.editor.activeDocument.title} />
      <UnsavedChangesIndicator
        isDirty={store?.isDirty}
        tooltipTx={store?.isDirty ? "unsaved-changes" : "saved-in-browser"}
        tooltipPosition="bottom"
        onPointerDown={store?.persistImmediately}
      />
    </TopConsoleContainer>
  ) : null;
});
