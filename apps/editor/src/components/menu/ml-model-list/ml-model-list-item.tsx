import {
  FlexRow,
  InvisibleButton,
  ListItem,
  Text,
} from "@visian/ui-shared";
import { MlModel } from "apps/editor/src/types";
import styled from "styled-components";

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
}) => {
  
  // const { t: translate } = useTranslation();

  return (
    <ListItem>
      <FlexRow onClick={createAutoAnnotationJob}>
        <Text>{model.name}</Text>
        <Spacer/>
        <VersionText>{`v${model.version}`}</VersionText>
      </FlexRow>
      <ExpandedSpacer />
      <InfoButton
        icon= {"info"}
        onPointerDown={() => {console.log("info")}}
      />
    </ListItem>
  );
};
