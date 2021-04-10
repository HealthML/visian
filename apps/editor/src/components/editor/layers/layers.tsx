import {
  FloatingUIButton,
  List,
  ListItem,
  Modal,
  SubtleText,
  useModalPosition,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";

const LayerList = styled(List)`
  margin-top: -16px;
`;

export const Layers: React.FC = observer(() => {
  const store = useStore();

  // Menu Toggling
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = useCallback(() => {
    setIsModalOpen(!isModalOpen);
  }, [isModalOpen]);

  // Menu Positioning
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);
  const modalPosition = useModalPosition(buttonRef, "right");

  return (
    <>
      <FloatingUIButton
        icon="layers"
        ref={setButtonRef}
        onPointerDown={toggleModal}
        isActive={isModalOpen}
      />
      <Modal style={modalPosition} isOpen={isModalOpen} label="Layers">
        <LayerList>
          {store?.editor.annotation && (
            <ListItem label="Annotation" icon="eye" />
          )}
          {store?.editor.image ? (
            <ListItem label="Base Image" icon="eye" isLast />
          ) : (
            <SubtleText text="No layers loaded." />
          )}
        </LayerList>
      </Modal>
    </>
  );
});
