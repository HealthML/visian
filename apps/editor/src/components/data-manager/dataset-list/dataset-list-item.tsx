import {
  color,
  fontSize,
  fontWeight,
  ListItem,
  OptionSelector,
  Text,
} from "@visian/ui-shared";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useUpdateDatasetsMutation } from "../../../queries";
import { Dataset } from "../../../types";
import { DatasetEditPopup } from "../dataset-edit-popup";

const StyledListItem = styled(ListItem)`
  height: 14vw;
  background-color: ${color("sheet")};
  border-radius: 15px;
`;

const StyledText = styled(Text)`
  font-size: ${fontSize("navigation")};
  font-weight: ${fontWeight("regular")};
  flex-grow: 1;
  cursor: pointer;
  max-width: 80%;
  overflow: hidden;
  margin-right: auto;
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

  // edit Dataset popup
  const [isEditDatasetPopupOpen, setIsEditDatasetPopupOpen] = useState(false);
  const openEditDatasetPopup = useCallback(
    () => setIsEditDatasetPopupOpen(true),
    [],
  );
  const closeEditDatasetPopup = useCallback(
    () => setIsEditDatasetPopupOpen(false),
    [],
  );

  const updateDataset = useUpdateDatasetsMutation();

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
          <OptionSelector
            options={[
              {
                value: "delete",
                labelTx: "delete",
                icon: "trash",
                iconSize: 30,
                onSelected: deleteDataset,
              },
              {
                value: "edit",
                label: "Edit",
                icon: "pixelBrush",
                iconSize: 30,
                onSelected: openEditDatasetPopup,
              },
            ]}
            pannelPosition="bottom"
          />
        </DatasetInfo>
      </DatasetWrapper>
      <DatasetEditPopup
        oldName={dataset.name}
        isOpen={isEditDatasetPopupOpen}
        onClose={closeEditDatasetPopup}
        onConfirm={(newName) =>
          updateDataset.mutate({ ...dataset, name: newName })
        }
      />
    </StyledListItem>
  );
};

export default DatasetListItem;
