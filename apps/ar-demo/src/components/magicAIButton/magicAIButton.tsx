import { Button } from "@visian/ui-shared";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { MagicAIButtonProps } from ".";

const StyledButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 300px;
  height: 50px;
  pointer-events: auto;
  position: absolute;
  bottom: 20px;
  left: calc(50% - 150px);
  cursor: pointer;
`;

const MagicAIButton: React.FC<MagicAIButtonProps> = (props) => {
  const { renderer, ...rest } = props;

  const [hasBeenClicked, setHasBeenClicked] = useState<boolean>(false);

  const [text, setText] = useState<string>("Generate AI segmentations");

  const callback = useCallback(() => {
    setHasBeenClicked(true);
    setText("Processing...");
    setTimeout(() => {
      renderer.setMeshVisibility(true);
      setText("AI results are shown");
    }, 1000);
  }, [setHasBeenClicked, renderer, setText]);

  return (
    <StyledButton
      {...rest}
      text={text}
      onPointerDown={hasBeenClicked ? undefined : callback}
    />
  );
};

export default MagicAIButton;
