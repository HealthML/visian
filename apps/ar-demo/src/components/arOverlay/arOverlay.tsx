import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import { AROverlayProps } from ".";
import { ClearIcon } from "../icons";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const overlayContainer = document.getElementById("ar-overlay")!;

const OverlayPortal: React.FC = ({ children }) =>
  ReactDOM.createPortal(children, overlayContainer);

const ExitContainer = styled.div`
  right: 20px;
  position: absolute;
  top: 20px;
`;

const AROverlay: React.FC<AROverlayProps> = (props) => {
  const { renderer, ...rest } = props;

  return (
    <OverlayPortal>
      <ExitContainer {...rest} onPointerUp={renderer.exitAR}>
        <ClearIcon />
      </ExitContainer>
    </OverlayPortal>
  );
};

export default AROverlay;
