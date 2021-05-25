import {
  FloatingUIButton,
  ILayer,
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

// Utilities
const noop = () => {
  // Intentionally left blank
};

// Styled Components
const LayerList = styled(List)`
  margin-top: -16px;
`;

const LayerListItem: React.FC<{
  layer: ILayer;
  isColorModalOpen?: boolean;
  colorRef?: (element: HTMLDivElement | SVGSVGElement | null) => void;
  onOpenColorModal?: (
    value: string | undefined,
    event: React.PointerEvent,
  ) => void;
}> = ({ layer, isColorModalOpen, colorRef, onOpenColorModal }) => {
  const toggleAnnotationVisibility = useCallback(() => {
    layer.setIsVisible(!layer.isVisible);
  }, [layer]);

  return (
    <ListItem
      icon={{ color: layer.color || "text" }}
      iconRef={colorRef}
      onIconPress={isColorModalOpen ? noop : onOpenColorModal}
      label={layer.title}
      trailingIcon={layer.isVisible ? "eye" : "eyeCrossed"}
      disableTrailingIcon={layer.isVisible}
      onTrailingIconPress={toggleAnnotationVisibility}
    />
  );
};

const LayerModal = styled(Modal)`
  padding-bottom: 0px;
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

  const layers = store?.editor.activeDocument?.layers;
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
          {layers?.length ? (
            layers.map((layer) => (
              // TODO: Rework colorRef to set ref according to clicked swatch.
              // Possibly, render one color panel per layer list item
              <LayerListItem
                layer={layer}
                isColorModalOpen={isColorModalOpen}
                colorRef={setColorRef}
                onOpenColorModal={openColorModal}
              />
            ))
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
