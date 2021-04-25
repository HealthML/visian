import {
  FloatingUIButton,
  List,
  ListItem,
  Modal,
  SubtleText,
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

  const toggleAnnotationVisibility = useCallback(() => {
    store?.editor.setIsAnnotationVisible(!store?.editor.isAnnotationVisible);
  }, [store?.editor]);
  const toggleImageVisibility = useCallback(() => {
    store?.editor.setIsImageVisible(!store?.editor.isImageVisible);
  }, [store?.editor]);

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
      <Modal
        isOpen={isModalOpen}
        labelTx="layers"
        parentElement={buttonRef}
        position="right"
      >
        <LayerList>
          {store?.editor.annotation && (
            <ListItem
              label={store?.editor.annotation.name}
              icon={store?.editor.isAnnotationVisible ? "eye" : "eyeCrossed"}
              disableIcon={store?.editor.isAnnotationVisible}
              onIconPress={toggleAnnotationVisibility}
            />
          )}
          {store?.editor.image ? (
            <ListItem
              label={store?.editor.image.name}
              icon={store?.editor.isImageVisible ? "eye" : "eyeCrossed"}
              disableIcon={store?.editor.isImageVisible}
              onIconPress={toggleImageVisibility}
              isLast
            />
          ) : (
            <SubtleText tx="no-layers" />
          )}
        </LayerList>
      </Modal>
    </>
  );
});
