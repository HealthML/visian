import {
  FloatingUIButton,
  Modal,
  SliderField,
  Switch,
  useModalPosition,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";

const SpacedSliderField = styled(SliderField)`
  margin-bottom: 16px;
`;

export const ViewSettings: React.FC = observer(() => {
  const store = useStore();

  // Menu Toggling
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = useCallback(() => {
    setIsModalOpen(!isModalOpen);
  }, [isModalOpen]);

  // Menu Positioning
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);
  const modalPosition = useModalPosition(buttonRef, "left");

  return (
    <>
      <FloatingUIButton
        icon="settings"
        ref={setButtonRef}
        onPointerDown={toggleModal}
        isActive={isModalOpen}
      />
      <Modal style={modalPosition} isOpen={isModalOpen} label="View Settings">
        <Switch
          label="Side Views"
          items={[{ value: "On" }, { value: "Off" }]}
        />
        <Switch
          label="Type"
          items={[{ value: "T" }, { value: "S" }, { value: "C" }]}
        />
        <SpacedSliderField label="Contrast" min={0} />
        <SpacedSliderField label="Brightness" />
        <SliderField label="Clamping" />
      </Modal>
    </>
  );
});
