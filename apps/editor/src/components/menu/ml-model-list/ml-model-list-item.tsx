import { FlexRow, InvisibleButton, ListItem, Text } from "@visian/ui-shared";
import styled from "styled-components";

import { MlModel } from "../../../types";

const Spacer = styled.div`
  width: 10px;
`;

const InfoButton = styled(InvisibleButton)`
  width: 18px;
`;

const VersionText = styled(Text)`
  font-size: 12px;
  color: #999999;
  margin: auto;
`;

const ModelFlexRow = styled(FlexRow)`
  margin-right: auto;
  cursor: pointer;
`;

export const ModelListItem = ({
  model,
  createAutoAnnotationJob,
}: {
  model: MlModel;
  createAutoAnnotationJob: () => void;
}) => (
  <ListItem>
    <ModelFlexRow onClick={createAutoAnnotationJob}>
      <Text>{model.name} </Text>
      <Spacer />
      <VersionText>{`v${model.version}`}</VersionText>
    </ModelFlexRow>
    <InfoButton icon="info" />
  </ListItem>
);
