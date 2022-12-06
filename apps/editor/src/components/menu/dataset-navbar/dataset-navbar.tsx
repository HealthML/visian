import { ButtonParam, SquareButton } from "@visian/ui-shared";
import styled from "styled-components";

const StyledButton = styled(SquareButton)`
  margin-left: 10px;
`;

const StyledButtonParam = styled(ButtonParam)`
  margin: 0px;
  width: auto;
`;

// eslint-disable-next-line react/destructuring-assignment
export const DatasetNavbar = ({
  inSelectMode,
  toggleSelectMode,
}: {
  inSelectMode: any;
  toggleSelectMode: any;
}) =>
  inSelectMode ? (
    <>
      <StyledButtonParam labelTx="Select All" />
      <StyledButton icon="export" tooltipTx="Export" />
      <StyledButton icon="trash" tooltipTx="Delete" />
      <StyledButton icon="whoAI" tooltipTx="Auto Anotate" />
      <StyledButton
        icon="exit"
        tooltipTx="Exit"
        onPointerDown={toggleSelectMode}
      />
    </>
  ) : (
    <StyledButton
      icon="select"
      tooltipTx="Select"
      onPointerDown={toggleSelectMode}
    />
  );
