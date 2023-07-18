import {
  Button,
  DropDown,
  ILayer,
  LayerList,
  PopUp,
  Serverity,
  Switch,
  Text,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
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

  useEffect(() => {
    if (shouldExportAllLayers) {
      setLayersToExport(
        store?.editor?.activeDocument?.layers?.filter(
          (layer) => layer.isAnnotation,
        ) ?? [],
      );
    } else {
      setLayersToExport(
        store?.editor?.activeDocument?.activeLayer
          ?.getFamilyLayers()
          .filter((layer) => layer.isAnnotation) ?? [],
      );
    }
  }, [store, isOpen, shouldExportAllLayers]);

  const handleExport = useCallback(async () => {
    store?.setProgress({ labelTx: "exporting" });

    try {
      if (selectedExtension === ".zip") {
        await store?.editor.activeDocument?.exportZip(layersToExport, true);
      } else {
        await store?.editor?.activeDocument?.exportSquashedNii(layersToExport);
      }
    } catch (error) {
      store?.setError({
        serverity: Serverity.error,
        titleTx: "export-error",
        descriptionTx: "no-file-to-export",
      });
    } finally {
      store?.setProgress();
    }
  }, [layersToExport, selectedExtension, store]);

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
          { labelTx: "export-layer-group", value: false },
          { labelTx: "export-all-layers", value: true },
        ]}
        value={shouldExportAllLayers}
        onChange={setShouldExportAllLayers}
      />
      <SectionLabel tx="export-as" />
      <InlineRow>
        <StyledDropDown
          options={fileExtensions}
          defaultValue={selectedExtension}
          onChange={(value) => setSelectedExtension(value)}
          size="medium"
          borderRadius="default"
        />
        <ExportButton tx="export" onClick={handleExport} />
      </InlineRow>
    </ExportPopUpContainer>
  );
});
