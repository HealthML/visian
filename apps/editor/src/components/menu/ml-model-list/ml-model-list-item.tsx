import {
  FlexRow,
  InvisibleButton,
  ListItem,
  Text,
} from "@visian/ui-shared";
import styled from "styled-components";

import { MlModel } from "../../../types";

const Spacer = styled.div`
  width: 10px;
`;

const ExpandedSpacer = styled.div`
  margin-right: auto;
`;

const InfoButton = styled(InvisibleButton)`
  width: 18px;
`;

const VersionText = styled(Text)`
  font-size: 12px;
  color: #999999;
  margin: auto;
`;


export const ModelListItem = ({
  model,
  createAutoAnnotationJob,
}: {
  model: MlModel;
  createAutoAnnotationJob: () => void;
}) => (
    <ListItem>
      <FlexRow onClick={createAutoAnnotationJob}>
        <Text>{model.name}</Text>
        <Spacer/>
        <VersionText>{`v${model.version}`}</VersionText>
      </FlexRow>
      <ExpandedSpacer />
      <InfoButton
        icon= "info"
      />
    </ListItem>
  );
