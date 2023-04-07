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
  deleteSelectedImages,
}: {
  isInSelectMode: boolean;
  allSelected: boolean;
  anySelected: boolean;
  toggleSelectMode: () => void;
  toggleSelectAll: () => void;
  openModelSelectionPopUp: () => void;
  deleteSelectedImages: () => void;
}) =>
  isInSelectMode ? (
    <>
      <StyledTextButton
        labelTx={allSelected ? "deselect-all" : "select-all"}
        handlePress={toggleSelectAll}
      />
      <StyledButton
        isDisabled
        icon="export"
        tooltipTx="export-documents"
        tooltipPosition="top"
      />
      <StyledButton
        icon="trash"
        tooltipTx="delete-documents"
        onPointerDown={deleteSelectedImages}
        tooltipPosition="top"
      />
      <StyledButton
        isDisabled={!anySelected}
        icon="mlAutoAnnotation"
        tooltipTx="auto-annotate-documents"
        tooltipPosition="top"
        onPointerDown={openModelSelectionPopUp}
      />
      <StyledButton
        icon="exit"
        tooltipTx="exit-select-mode"
        tooltipPosition="top"
        onPointerDown={toggleSelectMode}
      />
    </>
  ) : (
    <StyledButton
      icon="select"
      tooltipTx="select-mode"
      tooltipPosition="top"
      onPointerDown={toggleSelectMode}
    />
  );
