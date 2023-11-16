import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { color } from "../../theme";
import { InvisibleButton } from "../button";
import { Text } from "../text";
import { ListNavigatorProps } from "./list-navigator.props";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ArrowButton = styled(InvisibleButton)<{ isTop?: boolean }>`
  width: 20px;
  margin-right: 8px;
  transform: rotate(${({ isTop }) => (isTop ? "180deg" : "0deg")});
  transition: transform 0.1s ease-in-out;
`;

const StyledTextContainer = styled.div`
  display: flex;
  align-items: center;
  width: 170px;
`;

const StyledText = styled(Text)<{ hasChanges?: boolean }>`
  ${(props) => (props.hasChanges ? "margin-left: auto;" : "margin: auto;")}
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 150px;
`;
const ChangeIndicator = styled.div`
  width: 8px;
  height: 8px;
  margin-left: 10px;
  margin-right: auto;
  border-radius: 50%;
  background: ${color("gray")};
  cursor: pointer;
`;

export const ListNavigator: React.FC<ListNavigatorProps<string>> = ({
  list = [],
  currentItem,
  hasChanges,
  onClickHasChanges,
  onSwitch,
}) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const foundIndex = list.findIndex((item) => item === currentItem);
    return foundIndex !== -1 ? foundIndex : 0;
  });

  const navigate = useCallback(
    (direction: number) => {
      const newIndex: number =
        (currentIndex + direction + list.length) % list.length;
      setCurrentIndex(newIndex);
      onSwitch?.(newIndex);
    },
    [currentIndex, list.length, onSwitch],
  );

  return (
    <Container>
      <ArrowButton
        onPointerDown={() => navigate(-1)}
        icon="collapseOpen"
        isTop
      />
      <StyledTextContainer>
        <StyledText
          tx={currentItem}
          text={list[currentIndex]}
          hasChanges={hasChanges}
        />
        {hasChanges && <ChangeIndicator onClick={onClickHasChanges} />}
      </StyledTextContainer>
      <ArrowButton onPointerDown={() => navigate(1)} icon="collapseOpen" />
    </Container>
  );
};
