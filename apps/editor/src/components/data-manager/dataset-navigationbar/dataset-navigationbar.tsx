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
  openJobCreationPopUp,
  openImageImportPopUp,
  deleteSelectedImages,
}: {
  isInSelectMode: boolean;
  allSelected: boolean;
  anySelected: boolean;
  toggleSelectMode: () => void;
  toggleSelectAll: () => void;
  openJobCreationPopUp: () => void;
  openImageImportPopUp: () => void;
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
        isDisabled={!anySelected}
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
        onPointerDown={openJobCreationPopUp}
      />
      <StyledButton
        icon="exit"
        tooltipTx="exit-select-mode"
        tooltipPosition="top"
        onPointerDown={toggleSelectMode}
      />
    </>
  ) : (
    <>
      <StyledButton
        icon="import"
        tooltipTx="import-images"
        tooltipPosition="top"
        onPointerDown={openImageImportPopUp}
      />
      <StyledButton
        icon="select"
        tooltipTx="select-mode"
        tooltipPosition="top"
        onPointerDown={toggleSelectMode}
      />
    </>
  );
