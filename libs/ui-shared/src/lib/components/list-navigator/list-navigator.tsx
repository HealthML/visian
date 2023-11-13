import React, { useCallback, useState } from "react";
import styled from "styled-components";

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

export const ListNavigator: React.FC<ListNavigatorProps<string>> = ({
  list = [],
  currentItem,
  onChange,
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
      onChange?.(newIndex);
    },
    [currentIndex, list.length, onChange],
  );

  return (
    <Container>
      <ArrowButton
        onPointerDown={() => navigate(-1)}
        icon="collapseOpen"
        isTop
      />
      <Text tx={currentItem} text={list[currentIndex]} />
      <ArrowButton onPointerDown={() => navigate(1)} icon="collapseOpen" />
    </Container>
  );
};
