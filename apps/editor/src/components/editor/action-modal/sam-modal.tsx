import {
  ButtonParam,
  Modal,
  ModalHeaderButton,
  Switch,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import type {
  SAMTool,
  SAMToolEmbeddingState,
  SAMToolMode,
} from "../../../models";

const StyledModal = styled(Modal)`
  margin-top: 16px;
`;

export const SAMModal = observer(() => {
  const store = useStore();

  const samTool = store?.editor.activeDocument?.tools.tools[
    "sam-tool"
  ] as SAMTool;

  const setMode = useCallback(
    (value: SAMToolMode) => samTool.setMode(value),
    [samTool],
  );

  const close = useCallback(() => {
    samTool.close();
    store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
  }, [store, samTool]);

  const accept = useCallback(() => {
    samTool.submit();
    store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
  }, [store, samTool]);

  if (!samTool || !samTool.isActive) return null;

  const components: { [key in SAMToolEmbeddingState]: JSX.Element } = {
    uninitialized: (
      <ButtonParam
        labelTx="sam-tool-initialize"
        handlePress={() => samTool.loadEmbedding()}
        isLast
      />
    ),
    loading: <>Loading Embedding...</>,
    ready: (
      <>
        <Switch
          options={[
            { labelTx: "sam-tool-bounding-box", value: "bounding-box" },
            { labelTx: "sam-tool-points", value: "points" },
          ]}
          value={samTool.mode}
          onChange={setMode}
        />
        <ButtonParam labelTx="sam-tool-accept" isLast handlePress={accept} />
      </>
    ),
  };

  return (
    <StyledModal
      labelTx="sam-tool"
      headerChildren={
        <ModalHeaderButton
          icon="xSmall"
          tooltipTx="sam-tool-close"
          onPointerDown={close}
        />
      }
    >
      {components[samTool.embeddingState]}
    </StyledModal>
  );
});
