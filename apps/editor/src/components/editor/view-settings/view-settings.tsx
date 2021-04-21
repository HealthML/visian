import {
  FloatingUIButton,
  Modal,
  SliderField,
  Switch,
  useModalPosition,
} from "@visian/ui-shared";
import { ViewType } from "@visian/utils";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";

// Styled Components
const SpacedSliderField = styled(SliderField)`
  margin-bottom: 16px;
`;

// Menu Items
const sideViewsSwitchItems = [
  { labelTx: "on", value: true },
  { labelTx: "off", value: false },
];
const mainViewTypeSwitchItems = [
  { label: "T", value: ViewType.Transverse, tooltipTx: "transverse" },
  { label: "S", value: ViewType.Sagittal, tooltipTx: "sagittal" },
  { label: "C", value: ViewType.Coronal, tooltipTx: "coronal" },
];

export const ViewSettings: React.FC = observer(() => {
  const store = useStore();

  // Menu Toggling
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = useCallback(() => {
    setIsModalOpen(!isModalOpen);
  }, [isModalOpen]);

  // Menu Positioning
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);
  const modalPosition = useModalPosition(buttonRef, "left", isModalOpen);

  // Menu Actions
  const setContrast = useCallback(
    (value: number | number[]) => {
      store?.editor.viewSettings.setContrast(value as number);
    },
    [store],
  );
  const setBrightness = useCallback(
    (value: number | number[]) => {
      store?.editor.viewSettings.setBrightness(value as number);
    },
    [store],
  );

  return (
    <>
      <FloatingUIButton
        icon="settings"
        tooltipTx="view-settings"
        tooltipPosition="left"
        showTooltip={!isModalOpen}
        ref={setButtonRef}
        onPointerDown={toggleModal}
        isActive={isModalOpen}
      />
      <Modal
        style={modalPosition}
        isOpen={isModalOpen}
        labelTx="view-settings"
        onReset={store?.editor.viewSettings.reset}
      >
        {(!store?.editor.image || store?.editor.image.dimensionality > 2) && (
          <>
            <Switch
              labelTx="side-views"
              items={sideViewsSwitchItems}
              value={Boolean(store?.editor.viewSettings.shouldShowSideViews)}
              onChange={store?.editor.viewSettings.toggleSideViews}
            />
            <Switch
              labelTx="main-view-type"
              items={mainViewTypeSwitchItems}
              value={store?.editor.viewSettings.mainViewType}
              onChange={store?.editor.viewSettings.setMainViewType}
            />
          </>
        )}
        <SpacedSliderField
          labelTx="contrast"
          showValueLabel
          min={0}
          max={2}
          value={store?.editor.viewSettings.contrast}
          onChange={setContrast}
        />
        <SliderField
          labelTx="brightness"
          showValueLabel
          min={0}
          max={2}
          value={store?.editor.viewSettings.brightness}
          onChange={setBrightness}
        />
      </Modal>
    </>
  );
});
