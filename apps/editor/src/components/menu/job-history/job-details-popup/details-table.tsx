import { Text, useTranslation } from "@visian/ui-shared";
import styled from "styled-components";

export const DetailsTable = styled.div`
  display: table;
`;

const RowContainer = styled.div`
  display: table-row;
`;

const DetailsText = styled(Text)`
  display: table-cell;
  vertical-align: middle;
  padding: 0.3em 3em;
  padding-left: 0;
`;

export const DetailsRow = ({
  tx,
  text,
  value,
  content,
}: {
  content?: React.ReactNode;
  value?: string | undefined;
  tx?: string;
  text?: string;
}) => {
  const { t } = useTranslation();
  return (
    <RowContainer>
      <DetailsText tx={`${t(tx)}:`} text={`${text}:`} />
      {value && <DetailsText text={value} />}
      {!value && content}
    </RowContainer>
  );
};
