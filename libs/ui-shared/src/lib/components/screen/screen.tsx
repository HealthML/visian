import React, { useEffect } from "react";
import styled from "styled-components";

import { Box } from "../box";
import { ScreenProps } from "./screen.props";

export const Screen: React.FC<ScreenProps> = styled(
  ({ title, ...rest }: ScreenProps) => {
    useEffect(() => {
      if (title) document.title = title;
    }, [title]);

    return <Box {...rest} />;
  },
)`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  max-width: 100%;
  min-height: 100%;
  min-width: 100%;
  position: relative;
  width: 100%;
`;

export default Screen;
