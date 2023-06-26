import { color, Icon, Text, TextProps } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  margin-left: 20px;
  align-items: center;
`;

const WarningIcon = styled(Icon)`
  width: 1.1em;
  margin-right: 10px;
  margin-bottom: 2px;
  fill: ${color("red")} !important;
`;

const WarningText = styled(Text)`
  overflow: hidden;
  white-space: nowrap;
  color: ${color("red")};
`;

export const WarningLabel = observer<TextProps>((props) => (
  <Container>
    <WarningIcon icon="warning" />
    <WarningText {...props} />
  </Container>
));
