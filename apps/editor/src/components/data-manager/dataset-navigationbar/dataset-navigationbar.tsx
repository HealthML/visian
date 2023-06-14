import styled from "styled-components";

import { PageSectionButton, PageSectionIconButton } from "../page-section";

const Container = styled.div`
  display: flex;
  align-items: center;
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
    <Container>
      <PageSectionButton
        labelTx={allSelected ? "deselect-all" : "select-all"}
        handlePress={toggleSelectAll}
      />
      <PageSectionIconButton
        isDisabled
        icon="export"
        tooltipTx="export-documents"
        tooltipPosition="top"
      />
      <PageSectionIconButton
        isDisabled={!anySelected}
        icon="trash"
        tooltipTx="delete-documents"
        onPointerDown={deleteSelectedImages}
        tooltipPosition="top"
      />
      <PageSectionIconButton
        isDisabled={!anySelected}
        icon="mlAutoAnnotation"
        tooltipTx="auto-annotate-documents"
        tooltipPosition="top"
        onPointerDown={openJobCreationPopUp}
      />
      <PageSectionIconButton
        icon="exit"
        tooltipTx="exit-select-mode"
        tooltipPosition="top"
        onPointerDown={toggleSelectMode}
      />
    </Container>
  ) : (
    <Container>
      <PageSectionIconButton
        icon="import"
        tooltipTx="import-images"
        tooltipPosition="top"
        onPointerDown={openImageImportPopUp}
      />
      <PageSectionIconButton
        icon="select"
        tooltipTx="select-mode"
        tooltipPosition="top"
        onPointerDown={toggleSelectMode}
      />
    </Container>
  );
