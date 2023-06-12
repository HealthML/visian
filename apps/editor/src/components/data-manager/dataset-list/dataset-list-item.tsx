import {
  color,
  fontSize,
  fontWeight,
  InvisibleButton,
  ListItem,
  Text,
} from "@visian/ui-shared";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { Dataset } from "../../../types";

const StyledListItem = styled(ListItem)`
  width: 21vw;
  height: 14vw;
  background-color: ${color("sheet")};
  border-radius: 15px;
`;

const StyledText = styled(Text)`
  font-size: ${fontSize("navigation")};
  font-weight: ${fontWeight("regular")};
  flex-grow: 1;
  cursor: pointer;
`;

const ImageContainer = styled.div`
  height: 70%;
  border-radius: 15px 15px 0px 0px;
  overflow: hidden;
  cursor: pointer;
`;

const ImagePreview = styled.img`
  border-radius: inherit;
  max-width: 100%;
  height: auto;
`;

const DatasetInfo = styled.div`
  height: 30%;
  display: flex;
  flex-direction: row;
  justify-content: space-betreen;
  align-items: center;
  padding: 0px 20px 0px 30px;
`;

const DatasetWrapper = styled.div`
  height: 100%;
  width: 100%;
`;

const IconButton = styled(InvisibleButton)`
  width: 30px;
  flex-grow: 0;
`;

export const DatasetListItem = ({
  dataset,
  deleteDataset,
}: {
  dataset: Dataset;
  deleteDataset: () => void;
}) => {
  const navigate = useNavigate();

  const openDataset = () => {
    navigate(`/datasets/${dataset.id}`);
  };

  return (
    <StyledListItem innerHeight="auto" isLast>
      <DatasetWrapper>
        <ImageContainer onClick={openDataset}>
          <ImagePreview
            src="../../assets/images/walnut.png"
            alt="Scan Preview"
          />
        </ImageContainer>
        <DatasetInfo>
          <StyledText onClick={openDataset}>{dataset.name}</StyledText>
          <IconButton
            icon="trash"
            tooltipTx="delete-dataset-title"
            onPointerDown={deleteDataset}
            style={{ marginLeft: "auto" }}
            tooltipPosition="left"
          />
        </DatasetInfo>
      </DatasetWrapper>
    </StyledListItem>
  );
};

export default DatasetListItem;
