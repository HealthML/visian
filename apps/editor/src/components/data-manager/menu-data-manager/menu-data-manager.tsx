import {
  BlueButtonParam,
  ButtonParam,
  ColorMode,
  Divider,
  EnumParam,
  FloatingUIButton,
  Modal,
  Theme,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import styled, { useTheme } from "styled-components";

import { useStore } from "../../../app/root-store";
import { feedbackMailAddress } from "../../../constants";
import { MenuDataManagerProps } from "./menu-data-manager.props";

// Styled Components
const MenuButton = styled(FloatingUIButton)`
  margin-right: 16px;
`;

// Menu Items
const themeSwitchOptions = [
  { value: "dark", labelTx: "dark" },
  { value: "light", labelTx: "light" },
];

const languageSwitchOptions = [
  { label: "English", value: "en" },
  { label: "Deutsch", value: "de" },
];

export const MenuDataManager: React.FC<MenuDataManagerProps> = observer(
  ({ onOpenShortcutPopUp }) => {
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

    const { i18n } = useTranslation();
    const setLanguage = useCallback(
      (language: string) => {
        i18n.changeLanguage(language);
      },
      [i18n],
    );

    const sendFeedback = useCallback(() => {
      const mail = document.createElement("a");
      mail.href = `mailto:${feedbackMailAddress}`;
      mail.click();
    }, []);

    const openShortcutPopUp = useCallback(() => {
      if (onOpenShortcutPopUp) onOpenShortcutPopUp();
    }, [onOpenShortcutPopUp]);

    const theme = useTheme() as Theme;
    return (
      <>
        <MenuButton
          icon="burger"
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
          <EnumParam
            labelTx="theme"
            options={themeSwitchOptions}
            value={store?.colorMode || "dark"}
            setValue={setTheme}
          />
          <EnumParam
            labelTx="language"
            options={languageSwitchOptions}
            value={i18n.language.split("-")[0]}
            setValue={setLanguage}
          />
          <Divider />
          <ButtonParam labelTx="shortcuts" handlePress={openShortcutPopUp} />
          {feedbackMailAddress && (
            <BlueButtonParam
              labelTx="ideas-feedback"
              handlePress={sendFeedback}
            />
          )}
        </Modal>
      </>
    );
  },
);
