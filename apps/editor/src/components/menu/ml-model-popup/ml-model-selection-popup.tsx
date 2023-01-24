/* eslint-disable max-len */
import {
  PopUp,
  Text,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { ModelPopUpProps } from "./ml-model-selection-popup.props";
import useMlModels from "apps/editor/src/querys/use-ml-models";
import axios from "axios";
import { baseUrl } from "../../../querys/base-url";
import { MlModel } from "apps/editor/src/types";
import { MlModelList } from "../ml-model-list";


const SectionLabel = styled(Text)`
  font-size: 14px;
  margin-bottom: 8px;
`;


const ModelSelectionPopupContainer = styled(PopUp)`
  align-items: left;
  width: 400px;
`;

export const ModelSelectionPopup = observer<ModelPopUpProps>(({ isOpen, onClose, getSelectedImageList}) => { 
  
  const {mlModels, mlModelsError, isErrorMlModels, isLoadingMlModels, refetchMlModels, removeMlModels } =
    useMlModels();

  
  const createAutoAnnotationJob = (model: MlModel) => {
    const imageSelection = getSelectedImageList();

    console.log({
      "images": imageSelection,
      "modelName": model.name,
      "modelVersion": model.version

  });

    axios.post(`${baseUrl}jobs`, {
      "images": imageSelection,
      "modelName": model.name,
      "modelVersion": model.version

  }).then(function (response) {
      console.log(response);
      onClose && onClose();
    })
    .catch(function (error) {
      console.log(error);
      onClose && onClose();
    });
  };


  return (
    <ModelSelectionPopupContainer
      title="Model Selection"
      isOpen={isOpen}
      dismiss={onClose}
      shouldDismissOnOutsidePress
    >
      <SectionLabel text="Select the model you want to use to annotate the images" />
      {mlModels && (
        <MlModelList models={mlModels} createAutoAnnotationJob={createAutoAnnotationJob}/>
      )}
    </ModelSelectionPopupContainer>
  );
});
