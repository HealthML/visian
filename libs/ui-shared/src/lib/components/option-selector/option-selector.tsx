import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { SquareButton } from "../button";
import { Icon } from "../icon";
import { List, ListItem } from "../list";
import { Modal, ModalPosition } from "../modal";
import { Text } from "../text";
import { OptionSelectorProps } from "./option-selector.props";

const PanelDiv = styled(Modal)`
  position: absolute;
  margin-left: -10px;
  margin-right: -10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: 0px;
  padding-bottom: 0px;
  width: auto;
`;

const OptionsButton = styled(SquareButton)<{
  invisibleButton: boolean;
}>`
  border-width: ${({ invisibleButton }) => (invisibleButton ? 0 : 1)}px;
  width: 30px;
  height: 30px;
`;

const OptionItem = styled(ListItem)`
  cursor: pointer;
`;

const OptionIcon = styled(Icon)<{
  iconsSize: number;
  defaultIconSize: number;
}>`
  width: ${({ iconsSize }) => iconsSize}px;
  height: ${({ iconsSize }) => iconsSize}px;
  margin: -${({ iconsSize, defaultIconSize }) => (iconsSize - defaultIconSize) / 2}px;
`;

const OptionText = styled(Text)`
  margin-left: 10px;
`;

export const OptionSelector: React.FC<OptionSelectorProps> = ({
  options,
  pannelPosition = "left",
  buttonIcon = "moreHoriz",
  invisibleButton = true,
  onOptionSelected,
}) => {
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const openPannel = useCallback(() => {
    if (!isOpen) setIsOpen(true);
  }, [isOpen]);

  const closePannel = useCallback(() => {
    if (isOpen) setIsOpen(false);
  }, [isOpen]);

  return (
    <>
      <OptionsButton
        onPointerDown={openPannel}
        icon={buttonIcon}
        ref={setButtonRef}
        invisibleButton={invisibleButton}
      />
      <PanelDiv
        isOpen={isOpen}
        anchor={buttonRef}
        position={pannelPosition}
        onOutsidePress={closePannel}
      >
        <List>
          {options.map(
            ({ value, label, labelTx, icon, iconSize = 15 }, index) => (
              <OptionItem
                isLast={index === options.length - 1}
                onClick={() => {
                  onOptionSelected?.(value);
                  closePannel();
                }}
              >
                {icon && (
                  <OptionIcon
                    icon={icon}
                    iconsSize={iconSize}
                    defaultIconSize={15}
                  />
                )}
                {(label || labelTx) && <OptionText text={label} tx={labelTx} />}
              </OptionItem>
            ),
          )}
        </List>
      </PanelDiv>
    </>
  );
};
