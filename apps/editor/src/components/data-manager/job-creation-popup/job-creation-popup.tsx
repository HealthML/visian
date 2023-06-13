import {
  Box,
  Button,
  dataColorKeys,
  DropDown,
  FlexRow,
  IEnumParameterOption,
  PopUp,
  SectionHeader,
  StatusBadge,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { postJob, useImagesByDataset, useMlModels } from "../../../queries";
import { useDatasetsBy } from "../../../queries/use-datasets-by";
import { MlModel } from "../../../types";
import { ProjectDataExplorer } from "../project-data-explorer";
import { useImageSelection } from "../util";
import { JobCreationPopUpProps } from "./job-creation-popup.props";

const JobCreationPopupContainer = styled(PopUp)`
  align-items: left;
  width: 50vw;
  height: 70vh;
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  min-height: 200px;
`;

const StyledProjectDataExplorer = styled(ProjectDataExplorer)`
  flex: 1;
`;

const DropDownContainer = styled(FlexRow)`
  width: 50vw;
  justify-content: space-between;
`;

const StyledDropDown = styled(DropDown)`
  width: 48%;
`;

const StyledSectionHeader = styled(SectionHeader)`
  padding: 1em 0 0.5em 0;
`;

const StyledErrorText = styled(Text)`
  width: 100%;
  text-align: center;
`;

const Footer = styled(Box)`
  display: flex;
  justify-content: center;
  width: 50vw;
  margin-top: 10%;
`;

const ModelInfoSpacer = styled.div`
  height: 0.5em;
`;

const ModelTagGrid = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 5px;
`;

const ModelInfo = ({ model }: { model?: MlModel }) => {
  if (!model) return null;
  return (
    <>
      {model.description !== "" && <Text>{model?.description}</Text>}
      {model.description !== "" && model.tags.length > 0 && <ModelInfoSpacer />}
      {model.tags.length > 0 && (
        <ModelTagGrid>
          {model.tags.map((tag) => (
            <StatusBadge
              text={`${tag.key}: ${tag.value}`}
              borderColor={dataColorKeys[6]}
            />
          ))}
        </ModelTagGrid>
      )}
    </>
  );
};

export const JobCreationPopup = observer<JobCreationPopUpProps>(
  ({
    isOpen,
    onClose,
    projectId,
    activeImageSelection,
    openWithDatasetId,
    refetchJobs,
  }) => {
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
      return Array.from(uniqueNames, (modelName) => ({
        label: modelName,
        value: modelName,
      }));
    }, [mlModels]);

    const availableModelVersions = useMemo(
      () =>
        mlModels
          ? mlModels
              .filter((model) => model.name === selectedModelName)
              .map((model) => model.version)
          : [],
      [mlModels, selectedModelName],
    );

    const [selectedModelVersion, setSelectedModelVersion] = useState(
      availableModelVersions[0],
    );

    useEffect(() => {
      setSelectedModelVersion(availableModelVersions[0]);
    }, [availableModelVersions]);

    const mlModelVersionOptions: IEnumParameterOption<string>[] = useMemo(
      () =>
        availableModelVersions.map((modelVersion) => ({
          label: `v${modelVersion}`,
          value: modelVersion,
        })),
      [availableModelVersions],
    );

    const findModel = useCallback(
      (modelName, modelVersion) =>
        mlModels?.find(
          (model) => model.name === modelName && model.version === modelVersion,
        ),
      [mlModels],
    );

    const selectedModel = useMemo(
      () => findModel(selectedModelName, selectedModelVersion),
      [findModel, selectedModelName, selectedModelVersion],
    );

    const { datasets, datasetsError, isErrorDatasets, isLoadingDatasets } =
      useDatasetsBy(projectId);

    const [selectedDataset, setSelectedDataset] = useState(openWithDatasetId);

    useEffect(() => {
      setSelectedDataset(openWithDatasetId);
    }, [openWithDatasetId]);

    const { images, isErrorImages, isLoadingImages } =
      useImagesByDataset(selectedDataset);

    const selectDataset = useCallback((datasetId: string) => {
      setSelectedDataset(datasetId);
    }, []);

    const { selectedImages, setSelectedImages, setImageSelection } =
      useImageSelection();

    // TODO: Fix this Bug
    // Select all (Crtl + A) does not work correctly when adding missing dependencies openWithDatasetId and activeImageSelection
    useEffect(() => {
      if (openWithDatasetId && activeImageSelection && isOpen) {
        setSelectedImages(() => {
          const newSelectedImages = new Set<string>(activeImageSelection);
          return newSelectedImages;
        });
      }
    }, [isOpen]);

    const createAutoAnnotationJob = useCallback(
      async (imageSelection: string[]) => {
        if (!selectedModel) {
          store?.setError({
            titleTx: "error",
            descriptionTx: "ml-models-not-found-error",
          });
          return;
        }

        try {
          await postJob(imageSelection, selectedModel, projectId);
          refetchJobs?.();
          onClose?.();
        } catch (error) {
          store?.setError({
            titleTx: "internal-server-error",
            descriptionTx: "job-creation-error",
          });
          onClose?.();
        }
      },
      [selectedModel, store, projectId, refetchJobs, onClose],
    );

    const startJob = useCallback(
      () => createAutoAnnotationJob(Array.from(selectedImages)),
      [createAutoAnnotationJob, selectedImages],
    );

    const { t } = useTranslation();

    const showProjectDataExplorer = !(isLoadingDatasets || isErrorDatasets);

    const shouldShowModelInfo = useCallback(
      (option: string) => {
        const model = findModel(selectedModelName, option);
        return (
          (model?.description ?? "") !== "" || (model?.tags.length ?? 0) > 0
        );
      },
      [findModel, selectedModelName],
    );

    return (
      <JobCreationPopupContainer
        titleTx="job-creation-popup-title"
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        <ContentContainer>
          <StyledSectionHeader tx="job-creation-model-selection" />
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
              size="medium"
            />
            <StyledDropDown
              options={mlModelVersionOptions}
              value={selectedModelVersion}
              onChange={setSelectedModelVersion}
              size="medium"
              OptionInfo={({ option }: { option: string }) => (
                <ModelInfo model={findModel(selectedModelName, option)} />
              )}
              showOptionInfo={shouldShowModelInfo}
            />
          </DropDownContainer>
          {isLoadingDatasets && <StyledErrorText tx="datasets-loading" />}
          {isErrorDatasets && (
            <StyledErrorText>{`${t("datasets-loading-error")} ${
              datasetsError?.response?.statusText
            } (${datasetsError?.response?.status})`}</StyledErrorText>
          )}
          <StyledSectionHeader tx="job-creation-image-selection" />
          {showProjectDataExplorer && (
            <StyledProjectDataExplorer
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
        </ContentContainer>
        {showProjectDataExplorer && (
          <Footer>
            <Button
              isDisabled={!(selectedModelVersion && selectedImages.size > 0)}
              tx="start-job"
              onPointerDown={startJob}
            />
          </Footer>
        )}
      </JobCreationPopupContainer>
    );
  },
);
