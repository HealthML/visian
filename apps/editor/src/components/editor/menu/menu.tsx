import {
  Button,
  color,
  ColorMode,
  Divider,
  FloatingUIButton,
  Modal,
  sheetNoise,
  Switch,
  useModalPosition,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { feedbackMailAddress } from "../../../constants";

// Styled Components
const FeedbackButton = styled(Button)`
  width: 100%;
  background: ${sheetNoise}, ${color("blueSheet")};
  border-color: ${color("blueBorder")};
  margin-bottom: 16px;

  &:active {
    border-color: rgba(0, 133, 255, 1);
  }
`;

const MenuButton = styled(FloatingUIButton)`
  margin-right: 16px;
`;

const ResetButton = styled(Button)`
  width: 100%;
  background: ${sheetNoise}, ${color("redSheet")};
  border-color: ${color("redBorder")};

  &:active {
    border-color: rgba(202, 51, 69, 1);
  }
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

export const Menu: React.FC = observer(() => {
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
  const modalPosition = useModalPosition(buttonRef, "right", isModalOpen);

  // Menu Actions
  const setTheme = useCallback(
    (value: string) => {
      store?.setTheme(value as ColorMode);
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
        style={modalPosition}
        isOpen={isModalOpen}
        onOutsidePress={closeModal}
        labelTx="menu"
      >
        <Switch
          labelTx="theme"
          items={themeSwitchItems}
          onChange={setTheme}
          value={store?.theme || "dark"}
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
        <Divider />
        <ResetButton tx="clear-data" onPointerDown={store?.destroy} />
      </Modal>
    </>
  );
});
