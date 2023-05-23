import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { InvisibleButton } from "../button";
import { Icon } from "../icon";
import { List, ListItem } from "../list";
import { Modal } from "../modal";
import { Text } from "../text";
import { OptionSelectorProps } from "./option-selector.props";

const PanelDiv = styled(Modal)`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: 0px;
  padding-bottom: 0px;
  width: auto;
`;

const OptionsButton = styled(InvisibleButton)`
  width: 30px;
  height: 30px;
`;

const OptionItem = styled(ListItem)`
  cursor: pointer;
`;

const OptionIcon = styled(Icon)<{
  iconsize: number;
  defaulticonsize: number;
}>`
  width: ${({ iconsize }) => iconsize}px;
  height: ${({ iconsize }) => iconsize}px;
  margin: -${({ iconsize, defaulticonsize }) => (iconsize - defaulticonsize) / 2}px;
`;

const OptionText = styled(Text)`
  margin-left: 10px;
`;

export const OptionSelector: React.FC<OptionSelectorProps> = ({
  options,
  pannelPosition = "left",
  buttonIcon = "moreHoriz",
}) => {
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const openPannel = useCallback(() => {
    if (!isOpen) setIsOpen(true);
  }, [isOpen]);

  const closePannel = useCallback(() => {
    if (isOpen) setIsOpen(false);
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener("scroll", closePannel, true);

    return () => {
      window.removeEventListener("scroll", closePannel, true);
    };
  }, [closePannel]);

  return (
    <>
      <OptionsButton
        onPointerDown={openPannel}
        icon={buttonIcon}
        ref={setButtonRef}
      />
      <PanelDiv
        isOpen={isOpen}
        anchor={buttonRef}
        position={pannelPosition}
        onOutsidePress={closePannel}
        distance={0}
      >
        <List>
          {options.map(
            (
              { value, label, labelTx, icon, iconSize = 15, onSelected },
              index,
            ) => (
              <OptionItem
                isLast={index === options.length - 1}
                onClick={() => {
                  onSelected?.(value);
                  closePannel();
                }}
                key={value}
              >
                {icon && (
                  <OptionIcon
                    icon={icon}
                    iconsize={iconSize}
                    defaulticonsize={15}
                  />
                )}
                {(label || labelTx) && <OptionText text={label} tx={labelTx} />}
                {!label && !labelTx && !icon && (
                  <OptionText text={`${value}`} />
                )}
              </OptionItem>
            ),
          )}
        </List>
      </PanelDiv>
    </>
  );
};
