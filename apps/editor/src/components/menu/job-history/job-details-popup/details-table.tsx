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
  padding: 0.1em 3em;
  padding-left: 0;
`;

export const DetailsRow = ({
  value,
  tx,
  text,
}: {
  value: string | undefined;
  tx?: string;
  text?: string;
}) => {
  const { t } = useTranslation();
  return (
    <RowContainer>
      <DetailsText tx={`${t(tx)}:`} text={`${text}:`} />
      <DetailsText text={value ?? ""} />
    </RowContainer>
  );
};
