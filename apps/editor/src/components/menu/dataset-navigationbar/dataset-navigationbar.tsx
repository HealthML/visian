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
  toggleSelectMode,
  toggleSelectAll,
  deleteSelectedDocuments,
}: {
  isInSelectMode: boolean;
  allSelected: boolean;
  toggleSelectMode: () => void;
  toggleSelectAll: () => void;
  deleteSelectedDocuments: () => void;
}) =>
  isInSelectMode ? (
    <>
      <StyledTextButton
        labelTx={allSelected ? "deselect-all" : "select-all"}
        handlePress={toggleSelectAll}
      />
      <StyledButton icon="export" tooltipTx="export-documents" />
      <StyledButton
        icon="trash"
        tooltipTx="delete-documents"
        onPointerDown={deleteSelectedDocuments}
      />
      <StyledButton icon="whoAI" tooltipTx="auto-annotate-documents" />
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
