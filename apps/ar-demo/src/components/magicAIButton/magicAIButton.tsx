import { Sheet, Text } from "@classifai/ui-shared";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { MagicAIButtonProps } from ".";

const Container = styled(Sheet)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 250px;
  height: 50px;
  pointer-events: auto;
  position: absolute;
  bottom: 20px;
  left: calc(50% - 125px);
  cursor: pointer;
`;

const MagicAIButton: React.FC<MagicAIButtonProps> = (props) => {
  const { renderer, ...rest } = props;

  const [clicked, setClicked] = useState<boolean>(false);

  const [text, setText] = useState<string>("Use AI to generate segmentations.");

  const callback = useCallback(() => {
    setClicked(true);
    setText("Processing...");
    setTimeout(() => {
      renderer.setMeshVisibility(true);
      setText("AI results are shown.");
    }, 1000);
  }, [setClicked, renderer, setText]);

  return (
    <Container {...rest} onPointerDown={clicked ? undefined : callback}>
      <Text text={text} />
    </Container>
  );
};

export default MagicAIButton;
