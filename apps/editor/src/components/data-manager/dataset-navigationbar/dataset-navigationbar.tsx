import styled from "styled-components";

import { PageSectionButton, PageSectionIconButton } from "../page-section";
import { DatasetNavigationBarProps } from "./dataset-navigationbar.props";

const Container = styled.div`
  display: flex;
  align-items: center;
`;

export const DatasetNavigationBar: React.FC<DatasetNavigationBarProps> = ({
  isInSelectMode,
  allSelected,
  anySelected,
  toggleSelectMode,
  toggleSelectAll,
  openJobCreationPopUp,
  openImageImportPopUp,
  deleteSelectedImages,
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
        onClick={deleteSelectedImages}
        tooltipPosition="top"
      />
      <PageSectionIconButton
        isDisabled={!anySelected}
        icon="mlAutoAnnotation"
        tooltipTx="auto-annotate-documents"
        tooltipPosition="top"
        onClick={openJobCreationPopUp}
      />
      <PageSectionIconButton
        icon="exit"
        tooltipTx="exit-select-mode"
        tooltipPosition="top"
        onClick={toggleSelectMode}
      />
    </Container>
  ) : (
    <Container>
      <PageSectionIconButton
        icon="import"
        tooltipTx="import-images"
        tooltipPosition="top"
        onClick={openImageImportPopUp}
      />
      <PageSectionIconButton
        icon="select"
        tooltipTx="select-mode"
        tooltipPosition="top"
        onClick={toggleSelectMode}
      />
    </Container>
  );
