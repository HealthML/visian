import {
  fontSize,
  fontWeight,
  GridItem,
  InvisibleButton,
  Text,
} from "@visian/ui-shared";
import styled from "styled-components";

import { Dataset, Project } from "../../../types";

const StyledGridItem = styled(GridItem)`
  align-items: center;
  justify-content: center;
`;

const IconButton = styled(InvisibleButton)`
  width: 30px;
`;

const ClickableText = styled(Text)`
  font-size: ${fontSize("navigation")};
  font-weight: ${fontWeight("regular")};
  cursor: pointer;
`;

const ImageContainer = styled.div`
  flex: 1;
  border-radius: 5% 5% 0 0;
  overflow: hidden;
  cursor: pointer;
  max-height: 75%;
`;

const ImagePreview = styled.img`
  border-radius: inherit;
  width: 100%;
  object-fit: cover;
`;

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  justify-content: center;
`;

const Info = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: auto;
`;

export const GridViewItem = ({
  item,
  imgSrc,
  onDelete,
  onClick,
}: {
  item: Project | Dataset;
  imgSrc: string | undefined;
  onDelete: () => void;
  onClick: () => void;
}) => (
  <StyledGridItem innerHeight="auto">
    <Wrapper>
      {imgSrc && (
        <ImageContainer onClick={onClick}>
          <ImagePreview src={imgSrc} alt="Scan Preview" />
        </ImageContainer>
      )}
      <Info>
        <ClickableText onClick={onClick}>{item.name}</ClickableText>
        <IconButton
          icon="trash"
          tooltipTx="delete"
          onPointerDown={onDelete}
          tooltipPosition="left"
        />
      </Info>
    </Wrapper>
  </StyledGridItem>
);

export default GridViewItem;
