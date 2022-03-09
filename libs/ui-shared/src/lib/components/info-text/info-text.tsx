import { observer } from "mobx-react-lite";
import React, { useCallback, useRef, useState } from "react";
import styled, { useTheme } from "styled-components";
import { Theme } from "../../theme";
import { Divider, Modal, ModalHeaderButton } from "../modal";
import { Text } from "../text";
import { InfoTextProps } from "./info-text.props";

const StyledModal = styled(Modal)`
  width: 220px;
`;

const StyledText = styled(Text)<{ isLast?: boolean }>`
  font-size: 13px;
  margin-bottom: ${(props) => (props.isLast ? "0px" : "14px")};
`;

export const InfoText = observer<InfoTextProps>(
  ({
    titleTx = "help",
    infoTx,
    infoText,
    shortcuts,
    baseZIndex,
    position,
    icon = "info",
    shouldDismissOnOutsidePress = true,
    ...rest
  }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleModal = useCallback(
      (event: React.PointerEvent) => {
        event.stopPropagation();
        setIsModalOpen(!isModalOpen);
      },
      [isModalOpen],
    );
    const closeModal = useCallback(() => setIsModalOpen(false), []);

    const buttonRef = useRef<HTMLButtonElement>(null);

    const hasShortcuts = Boolean(shortcuts);
    const hasInfoText = Boolean(infoTx || infoText);

    const theme = useTheme() as Theme;

    return (
      <>
        <ModalHeaderButton
          icon={icon}
          onPointerDown={toggleModal}
          tooltipTx={titleTx}
          showTooltip={!isModalOpen}
          ref={buttonRef}
          {...rest}
        />
        <StyledModal
          labelTx={titleTx}
          isOpen={isModalOpen && (hasShortcuts || hasInfoText)}
          anchor={buttonRef.current}
          headerChildren={
            <ModalHeaderButton icon="xSmall" onPointerDown={closeModal} />
          }
          baseZIndex={
            baseZIndex === undefined ? theme.zIndices.info : baseZIndex
          }
          position={position}
          onOutsidePress={shouldDismissOnOutsidePress ? closeModal : undefined}
        >
          {hasInfoText && (
            <StyledText tx={infoTx} text={infoText} isLast={!hasShortcuts} />
          )}
          {hasShortcuts && (
            <>
              <Divider />
              {shortcuts}
            </>
          )}
        </StyledModal>
      </>
    );
  },
);
