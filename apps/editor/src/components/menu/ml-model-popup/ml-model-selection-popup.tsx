import {
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
import axios from "axios";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import styled from "styled-components";

import { useDataset, useMlModels } from "../../../queries";
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

export const ModelSelectionPopup = observer<ModelPopUpProps>(
  ({ isOpen, onClose, activeImageSelection, projectId }) => {
    const { mlModels, mlModelsError, isErrorMlModels, isLoadingMlModels } =
      useMlModels();

    const createAutoAnnotationJob = async (model: MlModel) => {
      try {
        await axios.post(`${hubBaseUrl}jobs`, {
          images: activeImageSelection,
          modelName: model.name,
          modelVersion: model.version,
        });
        // eslint-disable-next-line no-unused-expressions
        onClose && onClose();
      } catch (error: any) {
        // eslint-disable-next-line no-unused-expressions
        onClose && onClose();
      }
    };
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
            onChange={(newValue) => setSelectedModelName(newValue)}
          />
          <DropDown
            options={mlModelVersionOptions}
            value={selectedModel}
            onChange={(newValue) => setSelectedModel(newValue)}
          />
        </DropDownContainer>
        <ProjectDataExplorer projectId={projectId} />
      </ModelSelectionPopupContainer>
    );
  },
);
