import {
  FloatingUIButton,
  ILayer,
  List,
  ListItem,
  Modal,
  SubtleText,
  useDelay,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useRef, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { LayerSettings } from "../layer-settings";

// Utilities
const noop = () => {
  // Intentionally left blank
};

// Styled Components
const LayerList = styled(List)`
  margin-top: -16px;
`;

const LayerListItem = observer<{
  layer: ILayer;
}>(({ layer }) => {
  const toggleAnnotationVisibility = useCallback(() => {
    layer.setIsVisible(!layer.isVisible);
  }, [layer]);

  // Color Modal Toggling
  const [areLayerSettingsOpen, setAreLayerSettingsOpen] = useState(false);
  const isOpeningRef = useRef(false);
  const resetOpeningRef = useCallback(() => {
    isOpeningRef.current = false;
  }, []);
  const [schedule, cancel] = useDelay(resetOpeningRef, 25);
  const openLayerSettings = useCallback(() => {
    setAreLayerSettingsOpen(true);
    isOpeningRef.current = true;
    schedule();
  }, [schedule]);
  const closeLayerSettings = useCallback(() => {
    if (!isOpeningRef.current) setAreLayerSettingsOpen(false);
    isOpeningRef.current = false;
    cancel();
  }, [cancel]);

  // Color Modal Positioning
  const [colorRef, setColorRef] = useState<
    HTMLDivElement | SVGSVGElement | null
  >(null);

  return (
    <>
      <ListItem
        icon={{ color: layer.color || "text" }}
        iconRef={setColorRef}
        onIconPress={areLayerSettingsOpen ? noop : openLayerSettings}
        labelTx={layer.title ? undefined : "untitled-layer"}
        label={layer.title}
        trailingIcon={layer.isVisible ? "eye" : "eyeCrossed"}
        disableTrailingIcon={layer.isVisible}
        onTrailingIconPress={toggleAnnotationVisibility}
      />
      <LayerSettings
        layer={layer}
        isOpen={areLayerSettingsOpen}
        parentElement={colorRef}
        position="right"
        onOutsidePress={closeLayerSettings}
      />
    </>
  );
});

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
              <LayerListItem key={layer.id} layer={layer} />
            ))
          ) : (
            <ListItem isLast>
              <SubtleText tx="no-layers" />
            </ListItem>
          )}
        </LayerList>
      </LayerModal>
    </>
  );
});
