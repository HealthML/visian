import { PopUp, Text, useTranslation } from "@visian/ui-shared";
import axios from "axios";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

import { useMlModels } from "../../../queries";
import { hubBaseUrl } from "../../../queries/hub-base-url";
import { MlModel } from "../../../types";
import { MlModelList } from "../ml-model-list";
import { ModelPopUpProps } from "./ml-model-selection-popup.props";

const SectionLabel = styled(Text)`
  font-size: 14px;
  margin-bottom: 8px;
`;

const ModelSelectionPopupContainer = styled(PopUp)`
  align-items: left;
  width: 400px;
`;

export const ModelSelectionPopup = observer<ModelPopUpProps>(
  ({ isOpen, onClose, activeImageSelection }) => {
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
        {isLoadingMlModels && <Text tx="ml-models-loading" />}
        {isErrorMlModels && (
          <Text>{`${t("ml-models-loading-error")} ${
            mlModelsError?.response?.statusText
          } (${mlModelsError?.response?.status})`}</Text>
        )}
        {mlModels && mlModels.length > 0 ? (
          <>
            <SectionLabel tx="ml-model-selection-description" />
            <MlModelList
              models={mlModels}
              createAutoAnnotationJob={createAutoAnnotationJob}
            />
          </>
        ) : (
          <SectionLabel tx="ml-models-none-available" />
        )}
      </ModelSelectionPopupContainer>
    );
  },
);
