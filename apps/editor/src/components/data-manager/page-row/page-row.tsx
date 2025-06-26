import { space } from "@visian/ui-shared";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  gap: ${space("pageSectionMargin")};
`;

const Column = styled.div<{ width: number }>`
  width: ${(props) => props.width}%;
  display: flex;
  flex-direction: column;
`;

export const PageRow = ({
  columns,
}: {
  columns: { element: React.ReactNode; width: number }[];
}) => (
  <Container>
    {columns.map((column, index) => (
      <Column key={index} width={column.width}>
        {column.element}
      </Column>
    ))}
  </Container>
);
