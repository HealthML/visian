import {
  Button,
  color,
  ColorMode,
  Divider,
  FloatingUIButton,
  Modal,
  sheetNoise,
  Switch,
  Theme,
  useTranslation,
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

const FeedbackButton = styled(Button)`
  width: 100%;
  background: ${sheetNoise}, ${color("blueSheet")};
  border-color: ${color("blueBorder")};
  margin-bottom: 16px;

  &:active {
    border-color: rgba(0, 133, 255, 1);
  }
`;

const ResetButton = styled(Button)`
  width: 100%;
  background: ${sheetNoise}, ${color("redSheet")};
  border-color: ${color("redBorder")};
  margin-bottom: 16px;

  &:active {
    border-color: rgba(202, 51, 69, 1);
  }
`;

const ShortcutButton = styled(Button)`
  width: 100%;
`;

// Menu Items
const themeSwitchItems = [
  { value: "dark", labelTx: "dark" },
  { value: "light", labelTx: "light" },
];

const languageSwitchItems = [
  { label: "English", value: "en" },
  { label: "Deutsch", value: "de" },
];

export const Menu: React.FC<MenuProps> = observer((props) => {
  const {
    onOpenShortcutPopUp,
    onPointerLeaveButton,
    shouldForceTooltip,
  } = props;
  const store = useStore();

  // Menu Toggling
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
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

  const sendFeedback = useCallback(() => {
    const mail = document.createElement("a");
    mail.href = `mailto:${feedbackMailAddress}`;
    mail.click();
  }, []);

  const { i18n } = useTranslation();
  const setLanguage = useCallback(
    (language: string) => {
      i18n.changeLanguage(language);
    },
    [i18n],
  );

  const openShortcutPopUp = useCallback(
    (event: React.SyntheticEvent) => {
      event.stopPropagation();
      if (onOpenShortcutPopUp) onOpenShortcutPopUp();
    },
    [onOpenShortcutPopUp],
  );

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
        shouldForceTooltip={shouldForceTooltip}
        onPointerLeave={onPointerLeaveButton}
      />
      <Modal
        isOpen={isModalOpen}
        labelTx="menu"
        parentElement={buttonRef}
        position="right"
        baseZIndex={theme.zIndices.modal + 1}
        onOutsidePress={closeModal}
      >
        <Switch
          labelTx="theme"
          items={themeSwitchItems}
          onChange={setTheme}
          value={store?.colorMode || "dark"}
        />
        <Switch
          labelTx="language"
          items={languageSwitchItems}
          value={i18n.language.split("-")[0]}
          onChange={setLanguage}
        />
        {feedbackMailAddress && (
          <>
            <Divider />
            <FeedbackButton tx="ideas-feedback" onPointerDown={sendFeedback} />
          </>
        )}
        <ResetButton tx="clear-data" onPointerDown={store?.destroy} />
        <ShortcutButton text="Shortcuts" onPointerDown={openShortcutPopUp} />
      </Modal>
    </>
  );
});
