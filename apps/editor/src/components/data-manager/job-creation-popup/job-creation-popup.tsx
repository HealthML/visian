import {
  Box,
  Button,
  color,
  DropDown,
  FlexRow,
  Icon,
  IEnumParameterOption,
  List,
  ListItem,
  PopUp,
  SectionHeader,
  SubtleText,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import { MiaImage } from "@visian/utils";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";

import { JobCreationPopUpProps } from "./job-creation-popup.props";
import { useStore } from "../../../app/root-store";
import {
  jobsApi,
  useDatasetsByProject,
  useImagesByDataset,
  useMlModels,
} from "../../../queries";
import { ImageList } from "../image-list";
import { useImageSelection } from "../util";

const JobCreationPopupContainer = styled(PopUp)`
  align-items: left;
  width: calc(100% - 200px);
  max-width: 960px;
  max-height: 70vh;
`;

const ContentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  margin-bottom: 30px;
`;

const DropDownContainer = styled(FlexRow)`
  justify-content: space-between;
`;

const StyledDropDown = styled(DropDown)`
  width: 48%;
`;

const StyledSectionHeader = styled(SectionHeader)`
  padding: 1em 0 0.5em 0;
`;

const ImageListPlaceholder = styled.div`
  width: 100%;
`;

const ImageListContainer = styled.div`
  overflow: scroll;
  width: 100%;
`;

const FileExplorer = styled.div`
  display: flex;
  overflow: hidden;
  width: 100%;
`;

const VerticalLine = styled.div`
  border-left: 1px solid ${color("sheetBorder")};
  margin: 0 20px;
`;

const DatasetContainer = styled.div`
  overflow-y: auto;
  width: 100%;
`;

const DatasetTitle = styled(Text)`
  display: inline-block;
  padding: 4px 0 13px;
  opacity: 0.5;
`;

const DatasetList = styled(List)`
  width: 100%;
`;

const DatasetIcon = styled(Icon)`
  width: 2rem;
  height: 2rem;
  padding-right: 0.8rem;
`;

const DatasetListItem = styled(ListItem)<{ isActive?: boolean }>`
  cursor: pointer;
  // Fix too thick line on intersection between active items
  margin: 1px 3%;
  // Fix items moving by 1px on selection / deselection
  ${(props) =>
    !props.isActive &&
    css`
      padding: 1px 0;
    `}
`;

const ImageInfo = styled(Text)`
  width: 100%;
  text-align: center;
  padding-top: 100px;
`;

const StyledErrorText = styled(Text)`
  width: 100%;
  text-align: center;
`;

const Footer = styled(Box)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  gap: 1em;
`;

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

    const {
      data: mlModels,
      error: mlModelsError,
      isError: isErrorMlModels,
      isLoading: isLoadingMlModels,
    } = useMlModels();

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

    const [selectedModelVersion, setSelectedModelVersion] = useState<
      string | undefined
    >(availableModelVersions[0]);

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
      () =>
        mlModels?.find(
          (model) =>
            model.name === selectedModelName &&
            model.version === selectedModelVersion,
        ),
      [mlModels, selectedModelName, selectedModelVersion],
    );

    const {
      data: datasets,
      error: datasetsError,
      isError: isErrorDatasets,
      isLoading: isLoadingDatasets,
    } = useDatasetsByProject(projectId);

    const [selectedDataset, setSelectedDataset] = useState(openWithDatasetId);

    useEffect(() => setSelectedDataset(openWithDatasetId), [openWithDatasetId]);

    const { data: images, isError: isErrorImages } =
      useImagesByDataset(selectedDataset);

    const { selectedImages, selectImages } = useImageSelection();
    const selectedDatasetImages = Array.from(selectedImages).filter(
      (image) => image.dataset === selectedDataset,
    );
    // When images are selected in the image list, only the ones of the current dataset
    // should be affected:
    const setSelectedDatasetImages = useCallback(
      (imagesToBeSelected: MiaImage[]) => {
        const otherDatasetImages = Array.from(selectedImages).filter(
          (image) => image.dataset !== selectedDataset,
        );
        selectImages([...otherDatasetImages, ...imagesToBeSelected]);
      },
      [selectImages, selectedDataset, selectedImages],
    );

    // TODO: Fix this Bug
    // Select all (Crtl + A) does not work correctly when adding missing dependencies openWithDatasetId and activeImageSelection
    useEffect(() => {
      if (openWithDatasetId && activeImageSelection && isOpen) {
        selectImages([...activeImageSelection]);
      }
    }, [activeImageSelection, isOpen, openWithDatasetId, selectImages]);

    const createAutoAnnotationJob = useCallback(
      async (imageSelection: string[]) => {
        const selectedModel = findModel();
        if (!selectedModel) {
          store?.setError({
            titleTx: "error",
            descriptionTx: "ml-models-not-found-error",
          });
          return;
        }

        try {
          const job = await jobsApi.createJob({
            createJobDto: {
              images: imageSelection,
              modelName: selectedModel.name,
              modelVersion: selectedModel.version,
              project: projectId,
            },
          });
          refetchJobs?.();
          onClose?.();
          return job;
        } catch (error) {
          store?.setError({
            titleTx: "internal-server-error",
            descriptionTx: "job-creation-error",
          });
          onClose?.();
        }
      },
      [findModel, store, projectId, refetchJobs, onClose],
    );

    const startJob = useCallback(
      () =>
        createAutoAnnotationJob([...selectedImages].map((image) => image.id)),
      [createAutoAnnotationJob, selectedImages],
    );

    const { t } = useTranslation();

    const showProjectDataExplorer = !(isLoadingDatasets || isErrorDatasets);

    let imageInfoTx;
    if (isErrorImages) imageInfoTx = "images-loading-failed";
    else if (images && images.length === 0) imageInfoTx = "no-images-available";

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
            />
          </DropDownContainer>
          {isLoadingDatasets && <StyledErrorText tx="datasets-loading" />}
          {isErrorDatasets && (
            <StyledErrorText>{`${t("datasets-loading-error")} ${
              datasetsError?.response?.statusText
            } (${datasetsError?.response?.status})`}</StyledErrorText>
          )}
          <StyledSectionHeader tx="job-creation-image-selection" />
          <FileExplorer>
            {datasets && (
              <DatasetContainer>
                <DatasetTitle tx="datasets" />
                <DatasetList>
                  {datasets.map((dataset) => (
                    <DatasetListItem
                      key={dataset.id}
                      isLast
                      isActive={dataset.id === selectedDataset}
                      onPointerDown={() => setSelectedDataset(dataset.id)}
                    >
                      <DatasetIcon icon="folder" />
                      <Text>{dataset.name}</Text>
                    </DatasetListItem>
                  ))}
                </DatasetList>
              </DatasetContainer>
            )}
            <VerticalLine />
            {images ? (
              imageInfoTx ? (
                <ImageInfo tx={imageInfoTx} />
              ) : (
                <ImageListContainer>
                  <ImageList
                    images={images}
                    selectedImages={selectedDatasetImages}
                    onSelect={setSelectedDatasetImages}
                  />
                </ImageListContainer>
              )
            ) : (
              <ImageListPlaceholder />
            )}
          </FileExplorer>
        </ContentContainer>
        <Footer>
          {selectedImages.size > 0 && (
            <SubtleText
              tx="job-creation-images-selected"
              data={{ count: selectedImages.size }}
            />
          )}
          <Button
            isDisabled={
              !showProjectDataExplorer ||
              !selectedModelVersion ||
              selectedImages.size === 0
            }
            tx="start-job"
            onPointerDown={startJob}
          />
        </Footer>
      </JobCreationPopupContainer>
    );
  },
);
