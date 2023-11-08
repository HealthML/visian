import {
  color,
  GridItem,
  OptionSelector,
  radius,
  Text,
} from "@visian/ui-shared";
import { MiaIterableData } from "@visian/utils";
import styled from "styled-components";

const StyledGridItem = styled(GridItem)`
  cursor: pointer;
  border: 1px solid ${color("sheetBorder")};
`;

const OptionSelectorWrapper = styled.div`
  position: absolute;
  top: 2%;
  right: 5%;
`;

const StyledText = styled(Text)`
  margin: auto;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 80%;
`;

const OverflowText = styled(Text)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 80%;
  width: fill;
  flex: 1;
`;

const ImageContainer = styled.div`
  border-radius: ${radius("default")} ${radius("default")} 0 0;
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
  onEdit,
}: {
  item: MiaIterableData;
  imgSrc: string | undefined;
  onDelete: () => void;
  onClick: () => void;
  onEdit: () => void;
}) => (
  <StyledGridItem innerHeight="auto" onClick={onClick}>
    <Wrapper>
      {imgSrc ? (
        <>
          <ImageContainer>
            <ImagePreview src={imgSrc} alt="Preview" />
          </ImageContainer>
          <Info>
            <OverflowText title={item.name} text={item.name} />
            <OptionSelector
              options={[
                {
                  value: "delete",
                  labelTx: "delete",
                  icon: "trash",
                  iconSize: 30,
                  onSelected: onDelete,
                },
                {
                  value: "edit",
                  label: "Edit",
                  icon: "pixelBrush",
                  iconSize: 30,
                  onSelected: onEdit,
                },
              ]}
              pannelPosition="bottom"
            />
          </Info>
        </>
      ) : (
        <>
          <OptionSelectorWrapper>
            <OptionSelector
              options={[
                {
                  value: "delete",
                  labelTx: "delete",
                  icon: "trash",
                  iconSize: 30,
                  onSelected: onDelete,
                },
                {
                  value: "edit",
                  label: "Edit",
                  icon: "pixelBrush",
                  iconSize: 30,
                  onSelected: onEdit,
                },
              ]}
              pannelPosition="bottom"
            />
          </OptionSelectorWrapper>
          <StyledText title={item.name} text={item.name} />
        </>
      )}
    </Wrapper>
  </StyledGridItem>
);
