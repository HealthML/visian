import {
  BooleanParam,
  EnumParam,
  FloatingUIButton,
  Modal,
  NumberParam,
  useMultiRef,
} from "@visian/ui-shared";
import { ViewType } from "@visian/utils";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { useStore } from "../../../app/root-store";

// Menu Items
const mainViewTypeSwitchItems = [
  { label: "T", value: ViewType.Transverse, tooltipTx: "transverse" },
  { label: "S", value: ViewType.Sagittal, tooltipTx: "sagittal" },
  { label: "C", value: ViewType.Coronal, tooltipTx: "coronal" },
  { label: "3D", value: "3D" },
];

export const ViewSettings: React.FC = observer(() => {
  const store = useStore();

  // Ref Management
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);
  const outerRef = useRef<HTMLButtonElement>(null);
  const updateButtonRef = useMultiRef(setButtonRef, outerRef);

  useEffect(() => {
    store?.setRef("viewSettings", outerRef);

    return () => {
      store?.setRef("viewSettings");
    };
  }, [store, outerRef]);

  // Menu Toggling
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = useCallback(() => {
    setIsModalOpen(!isModalOpen);
  }, [isModalOpen]);

  // Menu Actions
  const setContrast = useCallback(
    (value: number | number[]) => {
      store?.editor.activeDocument?.viewSettings.setContrast(value as number);
    },
    [store],
  );
  const setBrightness = useCallback(
    (value: number | number[]) => {
      store?.editor.activeDocument?.viewSettings.setBrightness(value as number);
    },
    [store],
  );

  const setViewType = useCallback(
    (viewType: ViewType | "3D") => {
      if (viewType === "3D") {
        store?.editor.activeDocument?.viewSettings.setViewMode("3D");
      } else {
        store?.editor.activeDocument?.viewSettings.setViewMode("2D");
        store?.editor.activeDocument?.viewport2D.setMainViewType(viewType);
      }
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
        ref={updateButtonRef}
        onPointerDown={toggleModal}
        isActive={isModalOpen}
      />
      <Modal
        isOpen={isModalOpen}
        labelTx="view-settings"
        parentElement={buttonRef}
        position="left"
        onReset={store?.editor.activeDocument?.viewSettings.reset}
      >
        {store?.editor.activeDocument?.has3DLayers && (
          <>
            <EnumParam
              labelTx="main-view-type"
              options={mainViewTypeSwitchItems}
              value={
                store?.editor.activeDocument?.viewSettings.viewMode === "3D"
                  ? "3D"
                  : store?.editor.activeDocument?.viewport2D.mainViewType
              }
              setValue={setViewType}
            />
            {store?.editor.activeDocument?.viewSettings.viewMode === "2D" && (
              <BooleanParam
                labelTx="side-views"
                value={Boolean(
                  store?.editor.activeDocument?.viewport2D.showSideViews,
                )}
                setValue={
                  store?.editor.activeDocument?.viewport2D.toggleSideViews
                }
              />
            )}
          </>
        )}
        <NumberParam
          labelTx="contrast"
          extendBeyondMinMax
          min={0}
          max={2}
          value={store?.editor.activeDocument?.viewSettings.contrast}
          setValue={setContrast}
        />
        <NumberParam
          labelTx="brightness"
          extendBeyondMinMax
          min={0}
          max={2}
          value={store?.editor.activeDocument?.viewSettings.brightness}
          setValue={setBrightness}
        />
      </Modal>
    </>
  );
});
