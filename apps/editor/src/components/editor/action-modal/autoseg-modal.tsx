import {
  Button,
  ButtonParam,
  color,
  Divider,
  InfoText,
  LargePopUpColumn,
  LargePopUpColumnContainer,
  Modal,
  ModalHeaderButton,
  PopUp,
  Text,
  useLocalStorage,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { Trans } from "react-i18next";
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

const StyledPopUp = styled(PopUp)`
  width: 460px;
`;

const HelpText = styled.p`
  display: block;
  margin-bottom: 16px;
`;

const HelpDivider = styled(Divider)`
  margin-bottom: 24px;
`;

const HelpCloseButton = styled(Button)`
  align-self: flex-end;
`;

const HelpTextButton = styled(InfoText)`
  margin-right: 5px;
`;

const ActionButton = styled(ButtonParam)`
  svg {
    width: 40px;
  }
`;

const SoftButton = styled(ActionButton)`
  background: none;
  backdrop-filter: none;
`;

const KeyRow = styled(ShortcutRow)`
  align-items: flex-start;
  width: 75%;
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

  const [showsHelp, setShowsHelp] = useState(false);
  const [seenHelp, setSeenHelp] = useLocalStorage("auto-seg-help-seen", false);

  const autoSegTool = store?.editor.activeDocument?.tools.tools[
    "autoseg-tool"
  ] as AutoSegTool;

  const showHelp = useCallback(() => setShowsHelp(true), [setShowsHelp]);
  const closeHelp = useCallback(() => setShowsHelp(false), [setShowsHelp]);

  useEffect(() => {
    if (seenHelp) return;
    showHelp();
    setSeenHelp(true);
  }, [seenHelp, showHelp, setSeenHelp]);

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
          <HelpTextButton titleTx="help" onClick={showHelp} />
          <ModalHeaderButton icon="xSmall" onPointerDown={close} />
        </>
      }
    >
      {components[autoSegTool.embeddingState]}
      <StyledPopUp
        titleTx="autoseg-tool-help-title"
        isOpen={showsHelp}
        dismiss={closeHelp}
        shouldDismissOnOutsidePress
      >
        <LargePopUpColumnContainer>
          <LargePopUpColumn>
            <HelpText>
              <Trans i18nKey="autoseg-tool-help" />
            </HelpText>
            <HelpDivider />
            {shortcuts}
            <HelpCloseButton tx="autoseg-tool-help-close" onClick={closeHelp} />
          </LargePopUpColumn>
        </LargePopUpColumnContainer>
      </StyledPopUp>
    </StyledModal>
  );
});
