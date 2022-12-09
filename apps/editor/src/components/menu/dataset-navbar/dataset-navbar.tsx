import { ButtonParam, SquareButton } from "@visian/ui-shared";
import styled from "styled-components";

const StyledButton = styled(SquareButton)`
  margin-left: 10px;
`;

const StyledTextButton = styled(ButtonParam)`
  margin: 0px;
  width: auto;
`;

// eslint-disable-next-line react/destructuring-assignment
export const DatasetNavbar = ({
  inSelectMode,
  allSelected,
  toggleSelectMode,
  toggleSelectAll,
}: {
  inSelectMode: boolean;
  allSelected: boolean;
  toggleSelectMode: () => void;
  toggleSelectAll: () => void;
}) =>
  inSelectMode ? (
    <>
      <StyledTextButton
        labelTx={allSelected ? "Deselect All" : "Select All"}
        handlePress={toggleSelectAll}
      />
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
