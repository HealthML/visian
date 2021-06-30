import {
  BooleanParam,
  Divider,
  EnumParam,
  FloatingUIButton,
  Modal,
  ModalTitleRow,
  NumberParam,
  Param,
  useMultiRef,
} from "@visian/ui-shared";
import { ViewType } from "@visian/utils";
import { observer } from "mobx-react-lite";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useStore } from "../../../app/root-store";

// Menu Items
const mainViewTypeSwitchOptions = [
  { label: "T", value: ViewType.Transverse, tooltipTx: "transverse" },
  { label: "S", value: ViewType.Sagittal, tooltipTx: "sagittal" },
  { label: "C", value: ViewType.Coronal, tooltipTx: "coronal" },
  { label: "3D", value: "3D", tooltipTx: "3d-view-tooltip" },
];

const shadingModeSwitchOptions = [
  { labelTx: "shading-none", value: "none", tooltipTx: "shading-none-full" },
  { labelTx: "shading-phong", value: "phong", tooltipTx: "shading-phong-full" },
  { labelTx: "shading-lao", value: "lao", tooltipTx: "shading-lao-full" },
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
    async (viewType: ViewType | "3D" | "XR") => {
      if (viewType === "XR") {
        store?.editor.activeDocument?.viewport3D.enterXR();
      } else {
        if (store?.editor.activeDocument?.viewport3D.isInXR) {
          await store?.editor.activeDocument?.viewport3D.exitXR();
        }
        if (viewType === "3D") {
          store?.editor.activeDocument?.viewSettings.setViewMode("3D");
        } else {
          store?.editor.activeDocument?.viewSettings.setViewMode("2D");
          store?.editor.activeDocument?.viewport2D.setMainViewType(viewType);
        }
      }
    },
    [store],
  );

  const isXRAvailable = store?.editor.activeDocument?.viewport3D.isXRAvailable;
  const enrichedMainViewTypeSwitchOptions = useMemo(
    () =>
      isXRAvailable
        ? [
            ...mainViewTypeSwitchOptions,
            { label: "XR", value: "XR", tooltipTx: "xr-view-tooltip" },
          ]
        : mainViewTypeSwitchOptions,
    [isXRAvailable],
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
              selector="switch"
              options={enrichedMainViewTypeSwitchOptions}
              value={
                store?.editor.activeDocument?.viewport3D.isInXR
                  ? "XR"
                  : store?.editor.activeDocument?.viewSettings.viewMode === "3D"
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
        {store?.editor.activeDocument?.viewSettings.viewMode === "3D" && (
          <>
            <Divider />
            <ModalTitleRow
              labelTx="3d-view"
              onReset={
                store.editor.activeDocument.viewport3D.activeTransferFunction
                  ?.reset
              }
            />
            <EnumParam
              labelTx="shading-mode"
              options={shadingModeSwitchOptions}
              value={
                store.editor.activeDocument.viewport3D.suppressedShadingMode ||
                store.editor.activeDocument.viewport3D.shadingMode
              }
              setValue={store.editor.activeDocument.viewport3D.setShadingMode}
            />
            <EnumParam
              labelTx="transfer-function"
              options={Object.values(
                store.editor.activeDocument.viewport3D.transferFunctions,
              ).map((transferFunction) => ({
                labelTx: transferFunction.labelTx,
                label: transferFunction.label,
                value: transferFunction.name,
              }))}
              value={
                store.editor.activeDocument.viewport3D.activeTransferFunction
                  ?.name
              }
              setValue={
                store.editor.activeDocument.viewport3D.setActiveTransferFunction
              }
            />
            {store.editor.activeDocument.viewport3D.activeTransferFunction &&
              Object.values(
                store.editor.activeDocument.viewport3D.activeTransferFunction
                  .params,
              ).map((param) => <Param parameter={param} key={param.name} />)}
          </>
        )}
      </Modal>
    </>
  );
});
