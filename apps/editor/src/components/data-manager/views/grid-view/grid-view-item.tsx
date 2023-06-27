import { GridItem, InvisibleButton, Text } from "@visian/ui-shared";
import styled from "styled-components";

import { IterableData } from "../../../../types";

const StyledGridItem = styled(GridItem)`
  cursor: pointer;
`;

const IconButton = styled(InvisibleButton)`
  width: 30px;
`;

const StyledIconButton = styled(IconButton)`
  position: absolute;
  top: 2%;
  right: 2%;
`;

const StyledText = styled(Text)`
  margin: auto;
`;

const ImageContainer = styled.div`
  border-radius: 5% 5% 0 0;
  overflow: hidden;
  max-height: 75%;
`;

const ImagePreview = styled.img`
  border-radius: inherit;
  width: 100%;
  object-fit: cover;
`;

const Wrapper = styled.div`
  width: 100%;
  height: 230px;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Info = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  padding: 5%;
`;

export const GridViewItem = ({
  item,
  imgSrc,
  onDelete,
  onClick,
}: {
  item: IterableData;
  imgSrc: string | undefined;
  onDelete: () => void;
  onClick: () => void;
}) => (
  <StyledGridItem innerHeight="auto" onClick={onClick}>
    <Wrapper>
      {imgSrc ? (
        <>
          <ImageContainer>
            <ImagePreview src={imgSrc} alt="Preview" />
          </ImageContainer>
          <Info>
            <Text>{item.name}</Text>
            <IconButton
              icon="trash"
              tooltipTx="delete"
              onPointerDown={onDelete}
              tooltipPosition="right"
            />
          </Info>
        </>
      ) : (
        <>
          <StyledIconButton
            icon="trash"
            tooltipTx="delete"
            onPointerDown={onDelete}
            tooltipPosition="right"
          />
          <StyledText>{item.name}</StyledText>
        </>
      )}
    </Wrapper>
  </StyledGridItem>
);

export default GridViewItem;
