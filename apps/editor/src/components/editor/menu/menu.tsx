import {
  Button,
  color,
  ColorMode,
  Divider,
  FloatingUIButton,
  Modal,
  Switch,
  useModalPosition,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { feedbackMailAddress } from "../../../constants";

const FeedbackButton = styled(Button)`
  width: 100%;
  background: ${color("blueSheet")};
  border-color: ${color("blueBorder")};
  margin-bottom: 16px;

  &:active {
    border-color: rgba(0, 133, 255, 1);
  }
`;

const ResetButton = styled(Button)`
  width: 100%;
  background: ${color("redSheet")};
  border-color: ${color("redBorder")};

  &:active {
    border-color: rgba(202, 51, 69, 1);
  }
`;

export const Menu: React.FC = observer(() => {
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
  const modalPosition = useModalPosition(buttonRef, "right");

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

  return (
    <>
      <FloatingUIButton
        icon="menu"
        ref={setButtonRef}
        onPointerDown={isModalOpen ? undefined : openModal}
        isActive={isModalOpen}
      />
      <Modal
        style={modalPosition}
        isOpen={isModalOpen}
        onOutsidePress={closeModal}
        label="Menu"
      >
        <Switch
          label="Theme"
          items={[
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
          ]}
          onChange={setTheme}
          value={store?.theme || "dark"}
        />
        <Switch
          label="Language"
          items={[{ value: "English" }, { value: "German" }]}
        />
        <Divider />
        <FeedbackButton
          text="Ideas or Feedback?"
          onPointerDown={sendFeedback}
        />
        <Divider />
        <ResetButton text="Clear Data" onPointerDown={store?.destroy} />
      </Modal>
    </>
  );
});
