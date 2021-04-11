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

// Styled Components
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
  const modalPosition = useModalPosition(buttonRef, "right", isModalOpen);

  return (
    <>
      <FloatingUIButton
        icon="layers"
        tooltipTx="layers"
        showTooltip={!isModalOpen}
        ref={setButtonRef}
        onPointerDown={toggleModal}
        isActive={isModalOpen}
      />
      <Modal style={modalPosition} isOpen={isModalOpen} labelTx="layers">
        <LayerList>
          {store?.editor.annotation && (
            <ListItem label={store?.editor.annotation.name} />
          )}
          {store?.editor.image ? (
            <ListItem label={store?.editor.image.name} isLast />
          ) : (
            <SubtleText tx="no-layers" />
          )}
        </LayerList>
      </Modal>
    </>
  );
});
