import {
  BlueButtonParam,
  ButtonParam,
  ColorMode,
  Divider,
  EnumParam,
  FloatingUIButton,
  Modal,
  RedButtonParam,
  Theme,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import styled, { useTheme } from "styled-components";

import { useStore } from "../../../app/root-store";
import { feedbackMailAddress } from "../../../constants";
import { MenuProps } from "./menu.props";

// Styled Components
const MenuButton = styled(FloatingUIButton)`
  margin-right: 16px;
`;

// Menu Items
const themeSwitchOptions = [
  { value: "dark", labelTx: "dark" },
  { value: "light", labelTx: "light" },
];

export const Menu: React.FC<MenuProps> = observer(
  ({ onOpenShortcutPopUp, onOpenSettingsPopUp }) => {
    const store = useStore();

    // Menu Toggling
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = useCallback(() => {
      setIsModalOpen(true);
    }, []);
    const closeModal = useCallback(() => {
      setIsModalOpen(false);
    }, []);

    // Menu Positioning
    const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

    // Menu Actions
    const setTheme = useCallback(
      (value: string) => {
        store?.setColorMode(value as ColorMode);
      },
      [store],
    );

    const createNewDocument = useCallback(() => {
      store?.editor.newDocument();
    }, [store]);

    const sendFeedback = useCallback(() => {
      const mail = document.createElement("a");
      mail.href = `mailto:${feedbackMailAddress}`;
      mail.click();
    }, []);

    const openShortcutPopUp = useCallback(() => {
      if (onOpenShortcutPopUp) onOpenShortcutPopUp();
    }, [onOpenShortcutPopUp]);

    const openSettingsPopUp = useCallback(() => {
      if (onOpenSettingsPopUp) onOpenSettingsPopUp();
    }, [onOpenSettingsPopUp]);

    const destroy = useCallback(() => {
      store?.destroy();
    }, [store]);

    const theme = useTheme() as Theme;
    return (
      <>
        <MenuButton
          icon="menu"
          tooltipTx="menu"
          showTooltip={!isModalOpen}
          ref={setButtonRef}
          onPointerDown={isModalOpen ? undefined : openModal}
          isActive={isModalOpen}
        />
        <Modal
          isOpen={isModalOpen}
          labelTx="menu"
          anchor={buttonRef}
          position="right"
          baseZIndex={theme.zIndices.modal + 1}
          onOutsidePress={closeModal}
        >
          <ButtonParam labelTx="new-document" handlePress={createNewDocument} />
          <Divider />
          <EnumParam
            labelTx="theme"
            options={themeSwitchOptions}
            value={store?.colorMode || "dark"}
            setValue={setTheme}
          />
          <ButtonParam labelTx="settings" handlePress={openSettingsPopUp} />
          <Divider />
          <ButtonParam labelTx="shortcuts" handlePress={openShortcutPopUp} />
          {feedbackMailAddress && (
            <BlueButtonParam
              labelTx="ideas-feedback"
              handlePress={sendFeedback}
            />
          )}
          <RedButtonParam labelTx="clear-data" handlePress={destroy} isLast />
        </Modal>
      </>
    );
  },
);
