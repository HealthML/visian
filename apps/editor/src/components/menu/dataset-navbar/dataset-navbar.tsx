import { SquareButton } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

const MyButton = styled(SquareButton)`
  padding: 10px;
`;

export const DatasetNavbar = observer<{
  inSelectMode?: boolean;
  toggleSelectMode: boolean;
}>(({ inSelectMode, toggleSelectMode }) =>
  inSelectMode ? (
    <SquareButton icon="select" tooltipTx="select" />
  ) : (
    <SquareButton icon="layers" tooltipTx="layers" />
  ),
);
