/* eslint-disable max-len */
import {
  PopUp,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import axios from "axios";
import { observer } from "mobx-react-lite";
import styled from "styled-components";


import { baseUrl } from "../../../querys/base-url";
import useMlModels from "../../../querys/use-ml-models";
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

export const ModelSelectionPopup = observer<ModelPopUpProps>(({ isOpen, onClose, getSelectedImageList}) => { 
  
  const {mlModels, mlModelsError, isErrorMlModels, isLoadingMlModels} =
    useMlModels();

  
  const createAutoAnnotationJob = (model: MlModel) => {
    const imageSelection = getSelectedImageList();

    axios.post(`${baseUrl}jobs`, {
      "images": imageSelection,
      "modelName": model.name,
      "modelVersion": model.version

    }).then((_response) => onClose && onClose())
    .catch((_error) => onClose && onClose());
  };

  const { t } = useTranslation();
  
  return (
    <ModelSelectionPopupContainer
      title={t("ml-model-selection-title")}
      isOpen={isOpen}
      dismiss={onClose}
      shouldDismissOnOutsidePress
    >
      <SectionLabel text={t("ml-model-selection-description")} />
      {isLoadingMlModels && <Text tx={t("ml-models-loading")}/>}
      {isErrorMlModels && (
        <Text>{`${t("ml-models-loading-error")} ${
          mlModelsError?.response?.statusText
        } (${mlModelsError?.response?.status})`}</Text>
      )}
      {mlModels && (
        <MlModelList 
        models={mlModels}
        createAutoAnnotationJob={createAutoAnnotationJob}/>
      )}
    </ModelSelectionPopupContainer>
  );
});
