import { ButtonParam, SquareButton } from "@visian/ui-shared";
import styled from "styled-components";

const StyledButton = styled(SquareButton)`
  margin-left: 10px;
`;

const StyledTextButton = styled(ButtonParam)`
  margin: 0px;
  width: auto;
`;

export const DatasetNavigationbar = ({
  isInSelectMode,
  allSelected,
  anySelected,
  toggleSelectMode,
  toggleSelectAll,
  openModelSelectionPopUp,
}: {
  isInSelectMode: boolean;
  allSelected: boolean;
  anySelected: boolean;
  toggleSelectMode: () => void;
  toggleSelectAll: () => void;
  openModelSelectionPopUp: () => void;
}) =>
  isInSelectMode ? (
    <>
      <StyledTextButton
        labelTx={allSelected ? "deselect-all" : "select-all"}
        handlePress={toggleSelectAll}
      />
      <StyledButton isDisabled icon="export" tooltipTx="export-documents" />
      <StyledButton isDisabled icon="trash" tooltipTx="delete-documents" />
      <StyledButton
        isDisabled={!anySelected}
        icon="whoAI"
        tooltipTx="auto-annotate-documents"
        onPointerDown={openModelSelectionPopUp}
      />
      <StyledButton
        icon="exit"
        tooltipTx="exit-select-mode"
        onPointerDown={toggleSelectMode}
      />
    </>
  ) : (
    <StyledButton
      icon="select"
      tooltipTx="select-mode"
      onPointerDown={toggleSelectMode}
    />
  );
