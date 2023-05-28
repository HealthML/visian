import {
  ButtonParam,
  InfoText,
  Modal,
  ModalHeaderButton,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import type { SAMTool, SAMToolEmbeddingState } from "../../../models";
import {
  MouseIcon,
  ShortcutContainer,
  ShortcutDescription,
  ShortcutDescriptionContainer,
  ShortcutLabel,
  ShortcutRow,
} from "../shortcut-popup";

const StyledModal = styled(Modal)`
  margin-top: 16px;
`;

const HelpText = styled(InfoText)`
  margin-right: 5px;
`;

const SoftButton = styled(ButtonParam)`
  border: none;
  background: none;
`;

const KeyRow = styled(ShortcutRow)`
  align-items: flex-start;
  * {
    font-size: 13px !important;
  }
  svg {
    margin-top: -2px;
    width: auto;
    height: 20px;
  }
`;

const KeyContainer = styled(ShortcutContainer)`
  align-items: flex-start;
`;

const shortcuts = (
  <>
    <KeyRow>
      <KeyContainer>
        <MouseIcon icon="leftMouse" />
        <ShortcutLabel tx="drag" />
      </KeyContainer>
      <ShortcutDescriptionContainer>
        <ShortcutDescription tx="sam-tool-left-drag" />
      </ShortcutDescriptionContainer>
    </KeyRow>
    <KeyRow>
      <KeyContainer>
        <MouseIcon icon="leftMouse" />
        <ShortcutLabel tx="click" />
      </KeyContainer>
      <ShortcutDescriptionContainer>
        <ShortcutDescription tx="sam-tool-left" />
      </ShortcutDescriptionContainer>
    </KeyRow>
    <KeyRow>
      <KeyContainer>
        <MouseIcon icon="rightMouse" />
        <ShortcutLabel tx="click" />
      </KeyContainer>
      <ShortcutDescriptionContainer>
        <ShortcutDescription tx="sam-tool-right" />
      </ShortcutDescriptionContainer>
    </KeyRow>
  </>
);

export const SAMModal = observer(() => {
  const store = useStore();

  const samTool = store?.editor.activeDocument?.tools.tools[
    "sam-tool"
  ] as SAMTool;

  const close = useCallback(() => {
    samTool.close();
    store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
  }, [store, samTool]);

  const accept = useCallback(() => {
    samTool.submit();
    store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
  }, [store, samTool]);

  const clear = useCallback(() => samTool.discard(), [samTool]);

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
        <SoftButton labelTx="sam-tool-clear" handlePress={clear} />
        <ButtonParam labelTx="sam-tool-accept" isLast handlePress={accept} />
      </>
    ),
  };

  return (
    <StyledModal
      labelTx="sam-tool"
      headerChildren={
        <>
          <HelpText
            titleTx="help"
            infoTx="sam-tool-help"
            shortcuts={shortcuts}
          />
          <ModalHeaderButton
            icon="xSmall"
            tooltipTx="sam-tool-close"
            onPointerDown={close}
          />
        </>
      }
    >
      {components[samTool.embeddingState]}
    </StyledModal>
  );
});
