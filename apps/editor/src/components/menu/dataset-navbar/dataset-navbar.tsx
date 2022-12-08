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
  toggleSelectMode,
  toggleSelectAll,
}: {
  inSelectMode: boolean;
  toggleSelectMode: () => void;
  toggleSelectAll: (selection: boolean) => void;
}) =>
  inSelectMode ? (
    <>
      <StyledTextButton
        labelTx="Select All"
        handlePress={() => {
          toggleSelectAll(true);
        }}
      />
      <StyledButton icon="export" tooltipTx="Export" />
      <StyledButton icon="trash" tooltipTx="Delete" />
      <StyledButton icon="whoAI" tooltipTx="Auto Anotate" />
      <StyledButton
        icon="exit"
        tooltipTx="Exit"
        onPointerDown={() => {
          toggleSelectMode();
          toggleSelectAll(false);
        }}
      />
    </>
  ) : (
    <StyledButton
      icon="select"
      tooltipTx="Select"
      onPointerDown={toggleSelectMode}
    />
  );
