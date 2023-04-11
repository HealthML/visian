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
import axios from "axios";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { useImagesByDataset, useMlModels } from "../../../queries";
import { hubBaseUrl } from "../../../queries/hub-base-url";
import useDatasetsBy from "../../../queries/use-datasets-by";
import { MlModel } from "../../../types";
import { ProjectDataExplorer } from "../project-data-explorer/project-data-explorer";
import { JobCreationPopUpProps } from "./job-creation-popup.props";

const ModelSelectionPopupContainer = styled(PopUp)`
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

const BottomNavigationBar = styled(Box)`
  display: flex;
  justify-content: center;
  width: 50vw;
  margin-top: 10%;
`;
export const JobCreationPopup = observer<JobCreationPopUpProps>(
  ({ isOpen, onClose, projectId, activeImageSelection, openWithDatasetId }) => {
    const { mlModels, mlModelsError, isErrorMlModels, isLoadingMlModels } =
      useMlModels();

    const [selectedModelName, setSelectedModelName] = useState(
      (mlModels && mlModels[0]?.name) || "",
    );

    const mlModelNameOptions: IEnumParameterOption<string>[] = useMemo(() => {
      const uniqueNames: string[] = [];
      if (mlModels) {
        mlModels
          .map((model) => model.name)
          .forEach((element) => {
            if (!uniqueNames.includes(element)) {
              uniqueNames.push(element);
            }
          });
      }
      return uniqueNames.map((model) => ({ label: model, value: model }));
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

    const mlModelVersionOptions: IEnumParameterOption<MlModel>[] = useMemo(
      () =>
        availableModelVersions.map((model) => ({
          label: model.version,
          value: model,
        })),
      [availableModelVersions],
    );

    // TODO integrate Query Errors
    const { datasets } = useDatasetsBy(projectId);

    const [selectedDataset, setSelectedDataset] = useState(
      openWithDatasetId || "",
    );

    useEffect(() => {
      setSelectedDataset(openWithDatasetId || "");
    }, [openWithDatasetId]);

    const { images } = useImagesByDataset(selectedDataset);

    const selectDataset = useCallback((datasetId: string) => {
      setSelectedDataset(datasetId);
    }, []);

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

    useEffect(() => {
      if (openWithDatasetId && activeImageSelection) {
        setSelectedImages(() => {
          const newSelectedImages = new Map<string, Map<string, boolean>>([
            [
              openWithDatasetId,
              new Map<string, boolean>(
                activeImageSelection.map((image: string) => [image, true]),
              ),
            ],
          ]);
          return newSelectedImages;
        });
      }
    }, [activeImageSelection, openWithDatasetId]);

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

    const createAutoAnnotationJob = useCallback(
      async (imageSelection: string[]) => {
        try {
          await axios.post(`${hubBaseUrl}jobs`, {
            images: imageSelection,
            modelName: selectedModel.name,
            modelVersion: selectedModel.version,
            project: projectId,
          });
          // eslint-disable-next-line no-unused-expressions
          onClose && onClose();
        } catch (error: any) {
          // eslint-disable-next-line no-unused-expressions
          onClose && onClose();
        }
      },
      [onClose, selectedModel, projectId],
    );

    const selectionForJob: string[] = useMemo(
      () =>
        Array.from(selectedImages.values()).flatMap((imageMaps) =>
          Array.from(imageMaps.keys()),
        ),
      [selectedImages],
    );

    const imageSelectionForJob = useCallback(
      () => createAutoAnnotationJob(selectionForJob),
      [createAutoAnnotationJob, selectionForJob],
    );

    const { t } = useTranslation();

    return (
      <ModelSelectionPopupContainer
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
        <ProjectDataExplorer
          datasets={datasets}
          images={images}
          selectedDataset={selectedDataset}
          selectedImages={selectedImages}
          selectDataset={selectDataset}
          setImageSelection={setImageSelection}
        />

        <BottomNavigationBar>
          <Button
            isDisabled={!(selectedModel && selectionForJob.length > 0)}
            tx="start-job"
            onPointerDown={imageSelectionForJob}
          />
        </BottomNavigationBar>
      </ModelSelectionPopupContainer>
    );
  },
);
