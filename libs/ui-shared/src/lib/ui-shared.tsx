import React from "react";

import styled from "styled-components";

/* eslint-disable-next-line */
export interface UiSharedProps {}

const StyledUiShared = styled.div`
  color: pink;
`;

export function UiShared(props: UiSharedProps) {
  return (
    <StyledUiShared>
      <h1>Welcome to ui-shared!</h1>
    </StyledUiShared>
  );
}

export default UiShared;
