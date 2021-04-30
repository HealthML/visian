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
import { ColorPanel } from "../color-panel";

// Styled Components
const LayerList = styled(List)`
  margin-top: -16px;
`;

const LayerModal = styled(Modal)`
  padding-bottom: 0px;
`;

// Utilities
const noop = () => {
  // Intentionally left blank
};

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

  // Color Modal Toggling
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const openColorModal = useCallback(
    (_value: string | undefined, event: React.PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsColorModalOpen(true);
    },
    [],
  );
  const closeColorModal = useCallback(() => {
    setIsColorModalOpen(false);
  }, []);

  // Color Modal Positioning
  const [colorRef, setColorRef] = useState<
    HTMLDivElement | SVGSVGElement | null
  >(null);

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
      <LayerModal
        isOpen={isModalOpen}
        labelTx="layers"
        parentElement={buttonRef}
        position="right"
      >
        <LayerList>
          {store?.editor.annotation && (
            <ListItem
              icon={{ color: store?.editor.viewSettings.annotationColor }}
              iconRef={setColorRef}
              onIconPress={isColorModalOpen ? noop : openColorModal}
              label={store?.editor.annotation.name}
              trailingIcon={
                store?.editor.isAnnotationVisible ? "eye" : "eyeCrossed"
              }
              disableTrailingIcon={store?.editor.isAnnotationVisible}
              onTrailingIconPress={toggleAnnotationVisibility}
            />
          )}
          {store?.editor.image ? (
            <ListItem
              icon="image"
              label={store?.editor.image.name}
              trailingIcon={store?.editor.isImageVisible ? "eye" : "eyeCrossed"}
              disableTrailingIcon={store?.editor.isImageVisible}
              onTrailingIconPress={toggleImageVisibility}
              isLast
            />
          ) : (
            <ListItem isLast>
              <SubtleText tx="no-layers" />
            </ListItem>
          )}
        </LayerList>
      </LayerModal>
      <ColorPanel
        isOpen={isColorModalOpen}
        parentElement={colorRef}
        position="right"
        onOutsidePress={closeColorModal}
      />
    </>
  );
});
