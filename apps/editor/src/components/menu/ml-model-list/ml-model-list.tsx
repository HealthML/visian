import { List, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { MlModel } from "../../../types";
import { ModelListItem } from "./ml-model-list-item";

const ModelsList = styled(List)`
  width: 100%;
  height: 400px;
  overflow-y: auto;
`;

export const MlModelList = ({
  models,
  createAutoAnnotationJob,
}: {
  models: MlModel[];
  createAutoAnnotationJob: (model: MlModel) => void;
}) => (
  <ModelsList onWheel={stopPropagation}>
    {models.map((model: MlModel) => (
      <ModelListItem
        model={model}
        createAutoAnnotationJob={() => createAutoAnnotationJob(model)}
        key={`${model.name}${model.version}`}
      />
    ))}
  </ModelsList>
);
