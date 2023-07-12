import {
  ButtonParam,
  InfoText,
  Modal,
  ModalHeaderButton,
  Text,
  color,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import styled, { keyframes } from "styled-components";

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

const ActionButton = styled(ButtonParam)`
  svg {
    width: 40px;
  }
`;

const SoftButton = styled(ActionButton)`
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

const spinningKeyframes = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform:rotate(360deg); }
`;

const Spinner = styled.div`
  margin-right: 10px;
  margin-left: -20px;

  border-radius: 50%;
  width: 15px;
  height: 15px;
  display: inline-block;
  border-top: 2px solid transparent;
  border-left: 2px solid ${color("text")};
  border-right: 2px solid ${color("text")};
  border-bottom: 2px solid ${color("text")};
  animation: ${spinningKeyframes} 1s linear infinite;
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 15px 0;
`;

const SubtleText = styled(Text)`
  opacity: 0.5;
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
      <Status>
        <SubtleText tx="sam-tool-uninitialized" />
      </Status>
    ),
    loading: (
      <Status>
        <Spinner />
        <Text tx="sam-tool-initializing" />
      </Status>
    ),
    ready: (
      <>
        <SoftButton labelTx="sam-tool-clear" handlePress={clear} icon="reset" />
        <ActionButton
          labelTx="sam-tool-accept"
          isLast
          handlePress={accept}
          icon="checkSmall"
        />
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
