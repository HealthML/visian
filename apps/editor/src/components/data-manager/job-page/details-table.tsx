import { Text } from "@visian/ui-shared";
import styled from "styled-components";

export const DetailsTable = styled.div`
  display: table;
`;

const RowContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  width: 100%;
  align-items: center;
  min-height: 1.8em;
`;

const Label = styled(Text)`
  width: 33%;
  font-weight: bold;
`;

export const DetailsRow = ({
  tx,
  text,
  value,
  content,
}: {
  content?: React.ReactNode;
  value?: string;
  tx?: string;
  text?: string;
}) => (
  <RowContainer>
    <Label text={text} tx={tx} />
    {value && <Text text={value} />}
    {!value && content}
  </RowContainer>
);
