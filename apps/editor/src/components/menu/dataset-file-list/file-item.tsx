import { ListItem, SquareButton } from "@visian/ui-shared";
import styled from "styled-components";

const Spacer = styled.div`
  width: 10px;
`;

const InvisibleButton = styled(SquareButton)`
  border: none;
  padding: 12px;
`;

export const FileItem = ({
  inSelectMode,
  file,
  toggleSelection,
}: {
  inSelectMode: boolean;
  file: any;
  toggleSelection: any;
}) => {
  console.log(file.isSelected);
  return (
    <ListItem>
      {inSelectMode && (
        <>
          <InvisibleButton
            icon={file.isSelected === false ? "unchecked" : "checked"}
            tooltipTx="Select"
            onPointerDown={toggleSelection}
          />
          <Spacer />
        </>
      )}
      <h4>{file.name}</h4>
    </ListItem>
  );
};
