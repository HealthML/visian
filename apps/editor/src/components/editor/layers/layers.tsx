import {
  DelayHandlingButtonContainerProps,
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
  isLast?: boolean;
}>(({ layer, isLast }) => {
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
        icon={{
          color: layer.color || "text",
          icon:
            layer.kind === "image" && !layer.isAnnotation ? "image" : undefined,
        }}
        iconRef={setColorRef}
        onIconPress={areLayerSettingsOpen ? noop : openLayerSettings}
        labelTx={layer.title ? undefined : "untitled-layer"}
        label={layer.title}
        trailingIcon={layer.isVisible ? "eye" : "eyeCrossed"}
        disableTrailingIcon={layer.isVisible}
        onTrailingIconPress={toggleAnnotationVisibility}
        isLast={isLast}
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

export const Layers: React.FC<DelayHandlingButtonContainerProps> = observer(
  (props) => {
    const {
      onPointerEnterButton,
      onPointerLeaveButton,
      shouldForceTooltip,
    } = props;
    const store = useStore();

    // Menu Toggling
    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleModal = useCallback(() => {
      setIsModalOpen(!isModalOpen);
    }, [isModalOpen]);

    // Menu Positioning
    const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

    const layers = store?.editor.activeDocument?.layers;
    const layerCount = layers?.length;
    return (
      <>
        <FloatingUIButton
          icon="layers"
          tooltipTx="layers"
          showTooltip={!isModalOpen}
          ref={setButtonRef}
          onPointerDown={toggleModal}
          isActive={isModalOpen}
          onPointerEnter={onPointerEnterButton}
          onPointerLeave={onPointerLeaveButton}
          shouldForceTooltip={shouldForceTooltip}
        />
        <LayerModal
          isOpen={isModalOpen}
          labelTx="layers"
          parentElement={buttonRef}
          position="right"
        >
          <LayerList>
            {layerCount ? (
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              layers!.map((layer, index) => (
                <LayerListItem
                  key={layer.id}
                  layer={layer}
                  isLast={index === layerCount - 1}
                />
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
  },
);
