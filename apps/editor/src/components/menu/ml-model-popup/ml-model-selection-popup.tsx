import {
  Box,
  Button,
  color,
  DropDown,
  EnumParam,
  FlexColumn,
  FlexRow,
  Icon,
  IEnumParameterOption,
  List,
  ListItem,
  PopUp,
  Spacer,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import useDatasetsBy from "apps/editor/src/queries/use-datasets-by";
import axios from "axios";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { useDataset, useImagesBy, useMlModels } from "../../../queries";
import { hubBaseUrl } from "../../../queries/hub-base-url";
import { MlModel } from "../../../types";
import { MlModelList } from "../ml-model-list";
import { ProjectDataExplorer } from "../project-data-explorer/project-data-explorer";
import { ModelPopUpProps } from "./ml-model-selection-popup.props";

const SectionLabel = styled(Text)`
  font-size: 14px;
  margin-bottom: 8px;
`;

const ModelSelectionPopupContainer = styled(PopUp)`
  align-items: left;
  width: 50vw;
  height: 70vh;
`;

const DropDownContainer = styled(FlexRow)`
  width: 50vw;
  hight: 30%;
`;

const BottomNavigationBar = styled(Box)`
  display: flex;
  justify-content: center;
  margin-top: 10%;
`;
export const ModelSelectionPopup = observer<ModelPopUpProps>(
  ({ isOpen, onClose, projectId, activeImageSelection, openWithDatasetId }) => {
    const { mlModels, mlModelsError, isErrorMlModels, isLoadingMlModels } =
      useMlModels();

    const createAutoAnnotationJob = useCallback(
      async (imageSelection: string[]) => {
        try {
          await axios.post(`${hubBaseUrl}jobs`, {
            images: imageSelection,
            modelName: selectedModel.name,
            modelVersion: selectedModel.version,
          });
          // eslint-disable-next-line no-unused-expressions
          onClose && onClose();
        } catch (error: any) {
          // eslint-disable-next-line no-unused-expressions
          onClose && onClose();
        }
      },
      [],
    );

    const [selectedModelName, setSelectedModelName] = useState(
      (mlModels && mlModels[0].name) || "",
    );

    const mlModelNameOptions: IEnumParameterOption<string>[] = useMemo(
      () =>
        mlModels
          ? mlModels.map((model) => ({ label: model.name, value: model.name }))
          : [],
      [mlModels],
    );

    const availableModelVersions = useMemo(
      () =>
        mlModels
          ? mlModels.filter((model) => model.name === selectedModelName)
          : [],
      [mlModels, selectedModelName],
    );

    const [selectedModel, setSelectedModel] = useState(
      availableModelVersions[0],
    );

    const mlModelVersionOptions: IEnumParameterOption<MlModel>[] = useMemo(
      () =>
        availableModelVersions.map((model) => ({
          label: model.version,
          value: model,
        })),
      [availableModelVersions],
    );

    ////

    // TODO integrate Query Errors
    const { datasets, datasetsError, isErrorDatasets, isLoadingDatasets } =
      useDatasetsBy(projectId);

    const [selectedDataset, setSelectedDataset] = useState(
      (datasets &&
        openWithDatasetId &&
        datasets.filter((dataset) => dataset.id === openWithDatasetId)[0].id) ||
        "",
    );

    const {
      images,
      imagesError,
      isErrorImages,
      isLoadingImages,
      refetchImages,
    } = useImagesBy(selectedDataset);

    const selectDataset = useCallback(
      (datasetId: string) => {
        setSelectedDataset(datasetId);
      },
      [selectedDataset],
    );

    const [selectedImages, setSelectedImages] = useState<
      Map<string, Map<string, boolean>>
    >(
      (openWithDatasetId &&
        activeImageSelection &&
        new Map<string, Map<string, boolean>>([
          [
            openWithDatasetId,
            new Map<string, boolean>(
              (activeImageSelection ?? []).map((image: string) => [
                image,
                true,
              ]),
            ),
          ],
        ])) ||
        new Map(),
    );

    const setImageSelection = useCallback(
      (datasetId: string, imageId: string, selection: boolean) => {
        setSelectedImages((prevSelectedImages) => {
          if (selection) {
            prevSelectedImages.get(datasetId)?.set(imageId, selection);
          } else {
            prevSelectedImages.get(datasetId)?.delete(imageId);
          }
          prevSelectedImages.set(
            datasetId,
            prevSelectedImages.get(datasetId) || new Map(),
          );
          return new Map(prevSelectedImages);
        });
      },
      [],
    );

    const imageSelectionForJob = useCallback(() => {
      const selectionForJob = Array.from(selectedImages.values()).flatMap(
        (imageMaps) => Array.from(imageMaps.keys()),
      );
      return createAutoAnnotationJob(selectionForJob);
    }, [createAutoAnnotationJob, selectedImages]);

    const { t } = useTranslation();

    return (
      <ModelSelectionPopupContainer
        titleTx="ml-model-selection-title"
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        <SectionLabel tx="ml-model-selection-description" />
        {isLoadingMlModels && <Text tx="ml-models-loading" />}
        {isErrorMlModels && (
          <Text>{`${t("ml-models-loading-error")} ${
            mlModelsError?.response?.statusText
          } (${mlModelsError?.response?.status})`}</Text>
        )}
        <DropDownContainer>
          <DropDown
            options={mlModelNameOptions}
            value={selectedModelName}
            onChange={setSelectedModelName}
          />
          <DropDown
            options={mlModelVersionOptions}
            value={selectedModel}
            onChange={setSelectedModel}
          />
        </DropDownContainer>
        <ProjectDataExplorer
          datasets={datasets}
          images={images}
          selectedDataset={selectedDataset}
          selectedImages={selectedImages}
          selectDataset={selectDataset}
          setImageSelection={setImageSelection}
        />

        <BottomNavigationBar>
          <Button text="Start Job" onPointerDown={imageSelectionForJob} />
        </BottomNavigationBar>
      </ModelSelectionPopupContainer>
    );
  },
);
