import {
  Box,
  Button,
  DropDown,
  FlexRow,
  IEnumParameterOption,
  PopUp,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { postJob, useImagesByDataset, useMlModels } from "../../../queries";
import useDatasetsBy from "../../../queries/use-datasets-by";
import { MlModel } from "../../../types";
import { ProjectDataExplorer } from "../project-data-explorer/project-data-explorer";
import { JobCreationPopUpProps } from "./job-creation-popup.props";

const JobCreationPopupContainer = styled(PopUp)`
  align-items: left;
  width: 50vw;
  height: 70vh;
`;

const DropDownContainer = styled(FlexRow)`
  width: 50vw;
  padding-bottom: 3%;
`;

const StyledDropDown = styled(DropDown)`
  margin: 2%;
`;

const StyledErrorText = styled(Text)`
  width: 100%;
  text-align: center;
`;

const BottomNavigationBar = styled(Box)`
  display: flex;
  justify-content: center;
  width: 50vw;
  margin-top: 10%;
`;

export const JobCreationPopup = observer<JobCreationPopUpProps>(
  ({ isOpen, onClose, projectId, activeImageSelection, openWithDatasetId }) => {
    const store = useStore();

    const { mlModels, mlModelsError, isErrorMlModels, isLoadingMlModels } =
      useMlModels();

    const [selectedModelName, setSelectedModelName] = useState(
      (mlModels && mlModels[0]?.name) || "",
    );

    useEffect(() => {
      if (mlModels && mlModels.length > 0) {
        setSelectedModelName(mlModels[0].name);
      }
    }, [mlModels]);

    const mlModelNameOptions: IEnumParameterOption<string>[] = useMemo(() => {
      const uniqueNames = new Set(mlModels?.map((model) => model.name));
      return Array.from(uniqueNames, (model) => ({
        label: model,
        value: model,
      }));
    }, [mlModels]);

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

    useEffect(() => {
      setSelectedModel(availableModelVersions[0]);
    }, [availableModelVersions]);

    const mlModelVersionOptions: IEnumParameterOption<MlModel>[] = useMemo(
      () =>
        availableModelVersions.map((model) => ({
          label: model.version,
          value: model,
        })),
      [availableModelVersions],
    );

    const { datasets, datasetsError, isErrorDatasets, isLoadingDatasets } =
      useDatasetsBy(projectId);

    const [selectedDataset, setSelectedDataset] = useState(
      openWithDatasetId || "",
    );

    useEffect(() => {
      setSelectedDataset(openWithDatasetId || "");
    }, [openWithDatasetId]);

    const { images, isErrorImages, isLoadingImages } =
      useImagesByDataset(selectedDataset);

    const selectDataset = useCallback((datasetId: string) => {
      setSelectedDataset(datasetId);
    }, []);

    const [selectedImages, setSelectedImages] = useState<Set<string>>(
      new Set<string>(),
    );

    useEffect(() => {
      if (openWithDatasetId && activeImageSelection) {
        setSelectedImages(() => {
          const newSelectedImages = new Set<string>(activeImageSelection);
          return newSelectedImages;
        });
      }
    }, [activeImageSelection, openWithDatasetId]);

    const setImageSelection = useCallback(
      (imageId: string, isSelected: boolean) => {
        setSelectedImages((prevSelectedImages) => {
          const newSelectedImages = new Set(prevSelectedImages);
          if (isSelected) {
            newSelectedImages.add(imageId);
          } else {
            newSelectedImages.delete(imageId);
          }
          return newSelectedImages;
        });
      },
      [setSelectedImages],
    );

    const createAutoAnnotationJob = useCallback(
      async (imageSelection: string[]) => {
        try {
          await postJob(imageSelection, selectedModel, projectId);
          onClose?.();
        } catch (error) {
          store?.setError({
            titleTx: "internal-server-error",
            descriptionTx: "job-creation-error",
          });
          onClose?.();
        }
      },
      [onClose, selectedModel, projectId, store],
    );

    const startJob = useCallback(
      () => createAutoAnnotationJob(Array.from(selectedImages)),
      [createAutoAnnotationJob, selectedImages],
    );

    const { t } = useTranslation();

    const showProjectDataExplorer = !(isLoadingDatasets || isErrorDatasets);

    return (
      <JobCreationPopupContainer
        titleTx="job-creation-popup-title"
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        <Text>{`${t("ml-model-selection-description")}`}</Text>
        {isLoadingMlModels && <Text tx="ml-models-loading" />}
        {isErrorMlModels && (
          <Text>{`${t("ml-models-loading-error")} ${
            mlModelsError?.response?.statusText
          } (${mlModelsError?.response?.status})`}</Text>
        )}
        <DropDownContainer>
          <StyledDropDown
            options={mlModelNameOptions}
            value={selectedModelName}
            onChange={setSelectedModelName}
          />
          <StyledDropDown
            options={mlModelVersionOptions}
            value={selectedModel}
            onChange={setSelectedModel}
          />
        </DropDownContainer>
        {isLoadingDatasets && <StyledErrorText tx="datasets-loading" />}
        {isErrorDatasets && (
          <StyledErrorText>{`${t("datasets-loading-error")} ${
            datasetsError?.response?.statusText
          } (${datasetsError?.response?.status})`}</StyledErrorText>
        )}
        {showProjectDataExplorer && (
          <ProjectDataExplorer
            datasets={datasets}
            images={images}
            isErrorImages={isErrorImages}
            isLoadingImages={isLoadingImages}
            selectedDataset={selectedDataset}
            selectedImages={selectedImages}
            selectDataset={selectDataset}
            setImageSelection={setImageSelection}
            setSelectedImages={setSelectedImages}
          />
        )}
        {showProjectDataExplorer && (
          <BottomNavigationBar>
            <Button
              isDisabled={!(selectedModel && selectedImages.size > 0)}
              tx="start-job"
              onPointerDown={startJob}
            />
          </BottomNavigationBar>
        )}
      </JobCreationPopupContainer>
    );
  },
);
