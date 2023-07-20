import {
  ButtonParam,
  color,
  InfoText,
  Modal,
  ModalHeaderButton,
  Text,
  useLocalStorage,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import styled, { keyframes } from "styled-components";

import { useStore } from "../../../app/root-store";
import type { AutoSegTool, AutoSegToolState } from "../../../models";
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
  position: relative;
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
  margin-left: -10px;

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

const pulseKeyframes = keyframes`
	0% {
		transform: scale(0.95);
	}

	70% {
		transform: scale(1);
		box-shadow: 0 0 0 15px rgba(0, 0, 0, 0);
	}

	100% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
	}
`;

const HelpDot = styled.div`
  position: absolute;
  top: -5px;
  left: -5px;

  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${color("primary")};

  pointer-events: none;

  box-shadow: 0 0 0 0 ${color("primary")};
  transform: scale(1);
  animation: ${pulseKeyframes} 2s infinite;
`;

const shortcuts = (
  <>
    <KeyRow>
      <KeyContainer>
        <MouseIcon icon="leftMouse" />
        <ShortcutLabel tx="drag" />
      </KeyContainer>
      <ShortcutDescriptionContainer>
        <ShortcutDescription tx="autoseg-tool-left-drag" />
      </ShortcutDescriptionContainer>
    </KeyRow>
    <KeyRow>
      <KeyContainer>
        <MouseIcon icon="leftMouse" />
        <ShortcutLabel tx="click" />
      </KeyContainer>
      <ShortcutDescriptionContainer>
        <ShortcutDescription tx="autoseg-tool-left" />
      </ShortcutDescriptionContainer>
    </KeyRow>
    <KeyRow>
      <KeyContainer>
        <MouseIcon icon="rightMouse" />
        <ShortcutLabel tx="click" />
      </KeyContainer>
      <ShortcutDescriptionContainer>
        <ShortcutDescription tx="autoseg-tool-right" />
      </ShortcutDescriptionContainer>
    </KeyRow>
  </>
);

export const AutoSegModal = observer(() => {
  const store = useStore();

  const [clickedHint, setClickedHint] = useLocalStorage(
    "auto-seg-hint-clicked",
    false,
  );
  const clickHint = useCallback(() => setClickedHint(true), [setClickedHint]);

  const autoSegTool = store?.editor.activeDocument?.tools.tools[
    "autoseg-tool"
  ] as AutoSegTool;

  const close = useCallback(() => {
    autoSegTool.close();
    store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
  }, [store, autoSegTool]);

  const accept = useCallback(() => {
    autoSegTool.submit();
    store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
  }, [store, autoSegTool]);

  const clear = useCallback(() => autoSegTool.discard(), [autoSegTool]);

  if (!autoSegTool || !autoSegTool.isActive) return null;

  const components: { [key in AutoSegToolState]: JSX.Element } = {
    uninitialized: (
      <Status>
        <SubtleText tx="autoseg-tool-uninitialized" />
      </Status>
    ),
    loading: (
      <Status>
        <Spinner />
        <Text tx="autoseg-tool-initializing" />
      </Status>
    ),
    ready: (
      <>
        <SoftButton
          labelTx="autoseg-tool-clear"
          handlePress={clear}
          icon="reset"
        />
        <ActionButton
          labelTx="autoseg-tool-accept"
          isLast
          handlePress={accept}
          icon="checkSmall"
        />
      </>
    ),
  };

  return (
    <StyledModal
      labelTx="autoseg-tool"
      headerChildren={
        <>
          <HelpText
            titleTx="help"
            infoTx="autoseg-tool-help"
            shortcuts={shortcuts}
            onClick={clickHint}
          >
            {clickedHint || <HelpDot key="auto-seg-help" />}
          </HelpText>
          <ModalHeaderButton icon="xSmall" onPointerDown={close} />
        </>
      }
    >
      {components[autoSegTool.embeddingState]}
    </StyledModal>
  );
});
