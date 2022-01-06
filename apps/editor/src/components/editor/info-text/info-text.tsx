import {
  Divider,
  Modal,
  ModalHeaderButton,
  Spacer,
  Text,
  zIndex,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useRef, useState } from "react";
import styled from "styled-components";
import { MouseIcon, ShortcutContainer, ShortcutLabel } from "../shortcut-popup";
import { InfoTextProps } from "./info-text.props";

const StyledText = styled(Text)<{ isLast?: boolean }>`
  font-size: 13px;
  margin-bottom: ${(props) => (props.isLast ? "0px" : "14px")};
`;

const SpacedStyledShortcutContainer = styled(ShortcutContainer)`
  width: 100%;
  margin-bottom: 10px;
`;

const StyledShortcutContainer = styled(ShortcutContainer)`
  width: 100%;
`;

const ShortcutSpacer = styled(Spacer)`
  height: 10px;
`;

const StyledModal = styled(Modal)`
  z-index: ${zIndex("info")};
`;

export const InfoText = observer<InfoTextProps>(
  ({ infoTx, infoText, shortcuts, ...rest }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleModal = useCallback(() => setIsModalOpen(!isModalOpen), [
      isModalOpen,
    ]);
    const closeModal = useCallback(() => setIsModalOpen(false), []);

    const buttonRef = useRef<HTMLButtonElement>(null);

    const hasShortcuts = Boolean(shortcuts && shortcuts.length);
    const hasInfoText = Boolean(infoTx || infoText);

    return (
      <>
        <ModalHeaderButton
          icon="info"
          onPointerDown={toggleModal}
          tooltipTx="help"
          ref={buttonRef}
          {...rest}
        />
        <StyledModal
          labelTx="help"
          isOpen={isModalOpen && (hasShortcuts || hasInfoText)}
          anchor={buttonRef.current}
          headerChildren={
            <ModalHeaderButton icon="xSmall" onPointerDown={closeModal} />
          }
        >
          {hasInfoText && (
            <StyledText tx={infoTx} text={infoText} isLast={!hasShortcuts} />
          )}
          {hasShortcuts && (
            <>
              <Divider />
              <SpacedStyledShortcutContainer>
                <MouseIcon icon="leftMouse" />
                <ShortcutLabel text="Left Click" />
              </SpacedStyledShortcutContainer>
              <ShortcutSpacer />
              <StyledShortcutContainer>
                <MouseIcon icon="leftMouse" />
                <ShortcutLabel text="Left Click" />
              </StyledShortcutContainer>
            </>
          )}
        </StyledModal>
      </>
    );
  },
);
