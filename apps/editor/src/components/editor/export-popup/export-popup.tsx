import {
  Button,
  DropDown,
  ILayer,
  InvisibleButton,
  LayerList,
  PopUp,
  Switch,
  Text,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import path from "path";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { ExportPopUpProps } from "./export-popup.props";

const InlineRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 28px;
`;

const StyledSwitch = styled(Switch)`
  padding: 10px 0px;
`;

const ExportButton = styled(Button)`
  margin: 10px 0;
`;

const ExportPopUpContainer = styled(PopUp)`
  width: 300px;
`;

const SectionLabel = styled(Text)`
  font-size: 14px;
  margin-bottom: 8px;
`;

const StyledDropDown = styled(DropDown)`
  margin: 0px 10px 0px 0px;
  width: 200px;
  backdrop-filter: none;
  background: none;
`;

export const SelectionCheckbox = styled(InvisibleButton)<{
  emphasized?: boolean;
}>`
  width: 18px;
  margin-right: 8px;
  opacity: ${({ emphasized }) => (emphasized ? 1 : 0.4)};
  transition: opacity 0.1s ease-in-out;
`;

export const ExportPopUp = observer<ExportPopUpProps>(({ isOpen, onClose }) => {
  const store = useStore();

  const fileExtensions = [
    { value: ".nii.gz", label: ".nii.gz" },
    { value: ".zip", label: ".zip" },
  ];

  const [shouldExportAllLayers, setShouldExportAllLayers] = useState(false);
  const [layersToExport, setLayersToExport] = useState<ILayer[]>([]);
  const [selectedExtension, setSelectedExtension] = useState(
    fileExtensions[0].value,
  );
  const [shouldIncludeImages, setShouldIncludeImages] = useState(false);

  useEffect(() => {
    if (shouldExportAllLayers) {
      setLayersToExport(
        store?.editor?.activeDocument?.layers?.filter(
          (layer) => layer.isAnnotation || shouldIncludeImages,
        ) ?? [],
      );
    } else if (shouldIncludeImages) {
      const activeGroupLayers =
        store?.editor?.activeDocument?.activeLayer?.getAnnotationGroupLayers();
      const imageLayers =
        store?.editor?.activeDocument?.layers?.filter(
          (layer) => !layer.isAnnotation,
        ) ?? [];

      const combinedLayers = activeGroupLayers?.concat(imageLayers) ?? [];
      setLayersToExport(combinedLayers);
    } else {
      setLayersToExport(
        store?.editor?.activeDocument?.activeLayer?.getAnnotationGroupLayers() ??
          [],
      );
    }
  }, [store, isOpen, shouldExportAllLayers, shouldIncludeImages]);

  const handleExport = useCallback(async () => {
    store?.setProgress({ labelTx: "exporting" });

    try {
      const annotationGroupTitle =
        store?.editor?.activeDocument?.activeLayer?.annotationGroup?.title;

      let fileName;

      if (shouldExportAllLayers) {
        fileName = undefined;
      } else {
        fileName = annotationGroupTitle
          ? path.basename(
              annotationGroupTitle,
              path.extname(annotationGroupTitle),
            )
          : undefined;
      }
      if (selectedExtension === ".zip") {
        await store?.editor.activeDocument?.exportZip(layersToExport, fileName);
      } else {
        await store?.editor?.activeDocument?.exportSquashedNii(
          layersToExport,
          fileName,
        );
      }
    } catch (error) {
      store?.setError({
        titleTx: "export-error",
        descriptionTx: "no-file-to-export",
      });
    } finally {
      store?.setProgress();
    }
  }, [layersToExport, selectedExtension, shouldExportAllLayers, store]);

  const handleCheckIncludeImageLayer = useCallback(
    (value: boolean) => {
      if (value) {
        const imageLayers =
          store?.editor?.activeDocument?.layers?.filter(
            (layer) => !layer.isAnnotation,
          ) ?? [];
        const newLayersToExport = layersToExport.concat(imageLayers);
        setLayersToExport(newLayersToExport);
        setShouldIncludeImages(true);
      } else {
        setLayersToExport(layersToExport.filter((layer) => layer.isAnnotation));
        setShouldIncludeImages(false);
      }
    },
    [layersToExport, store?.editor?.activeDocument?.layers],
  );

  const handleSelectExtension = useCallback((value: string) => {
    if (value === ".nii.gz") {
      setLayersToExport(
        store?.editor?.activeDocument?.activeLayer?.getAnnotationGroupLayers() ??
          [],
      );
      setShouldIncludeImages(false);
    }
    setSelectedExtension(value);
  }, []);

  return (
    <ExportPopUpContainer
      titleTx="export"
      isOpen={isOpen}
      dismiss={onClose}
      shouldDismissOnOutsidePress
    >
      <SectionLabel tx="layers-to-export" />
      <LayerList layers={layersToExport} />
      <StyledSwitch
        options={[
          { labelTx: "export-annotation-group", value: false },
          { labelTx: "export-all-layers", value: true },
        ]}
        value={shouldExportAllLayers}
        onChange={setShouldExportAllLayers}
      />
      {selectedExtension === ".zip" && (
        <InlineRow>
          <SectionLabel tx="should-export-images" />
          <SelectionCheckbox
            icon={shouldIncludeImages ? "checked" : "unchecked"}
            onPointerDown={() =>
              handleCheckIncludeImageLayer(!shouldIncludeImages)
            }
            emphasized={shouldIncludeImages}
          />
        </InlineRow>
      )}
      <SectionLabel tx="export-as" />
      <InlineRow>
        <StyledDropDown
          options={fileExtensions}
          defaultValue={selectedExtension}
          onChange={(value) => handleSelectExtension(value)}
          size="medium"
          borderRadius="default"
        />
        <ExportButton tx="export" onClick={handleExport} />
      </InlineRow>
    </ExportPopUpContainer>
  );
});
