import {
  color,
  FlexColumn,
  FlexRow,
  Icon,
  List,
  ListItem,
  PopUp,
  Spacer,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import axios from "axios";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

import { useDataset, useMlModels } from "../../../queries";
import { hubBaseUrl } from "../../../queries/hub-base-url";
import useDatasetsBy from "../../../queries/use-datasets-by";
import { MlModel } from "../../../types";
import { MlModelList } from "../ml-model-list";
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

const FileExplorer = styled(FlexRow)`
  width: 100%;
  height: 50%;
`;

const StyledList = styled(List)`
  overflow-y: auto;
`;

const StyledIcon = styled(Icon)`
  width: 2rem;
  height: 2rem;
  padding-right: 0.8rem;
`;

const VerticalLine = styled.div`
  border-left: 1px solid ${color("sheetBorder")};
  margin: 0 1vw;
`;

export const ModelSelectionPopup = observer<ModelPopUpProps>(
  ({ isOpen, onClose, activeImageSelection, projectId }) => {
    const { datasets, datasetsError, isErrorDatasets, isLoadingDatasets } =
      useDatasetsBy(projectId);

    // const { dataset, datasetError, isErrorDataset, isLoadingDataset } =
    //   useDataset(datasetId);

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
        <FileExplorer>
          {datasets && (
            <StyledList>
              {datasets.map((dataset) => (
                <ListItem key={dataset.id} isLast={true}>
                  <StyledIcon icon="folder"></StyledIcon>
                  <Text>{dataset.name}</Text>
                </ListItem>
              ))}
            </StyledList>
          )}
          <VerticalLine></VerticalLine>
          {datasets && (
            <StyledList>
              {datasets.map((dataset) => (
                <ListItem key={dataset.id} isLast={true}>
                  <StyledIcon icon="document"></StyledIcon>
                  <Text>{dataset.name}</Text>
                </ListItem>
              ))}
            </StyledList>
          )}
        </FileExplorer>
      </ModelSelectionPopupContainer>
    );
  },
);
