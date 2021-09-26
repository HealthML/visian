import { PopUp, Text } from "@visian/ui-shared";
import React from "react";
import styled, { css, keyframes } from "styled-components";
import { ProgressPopUpProps } from "./progress-popup.props";

const ProgressTitle = styled(Text)`
  font-size: 20px;
  margin-bottom: 24px;
`;

const ProgressBarContainer = styled.div`
  position: relative;
  width: 100%;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.2);
`;

const loadIndeterminate = keyframes`
  0% { left: 0; right: 100%; }
  50% {left: 0; right: 0; }
  100% { left: 100%; right: 0; }
`;

const ProgressBar = styled.div<Pick<ProgressPopUpProps, "progress">>`
  position: absolute;
  height: 100%;
  background-color: #fff;

  ${(props) =>
    props.progress === undefined
      ? css`
          animation: ${loadIndeterminate} 2.5s cubic-bezier(0.4, 0, 0.2, 1)
            infinite;
        `
      : css`
          left: 0;
          width: ${props.progress * 100}%;
        `}
`;

const ProgressPopUpContainer = styled(PopUp)`
  align-items: center;
  justify-content: center;
  width: 400px;
  height: auto;
  padding: 30px 50px 38px 50px;
`;

export const ProgressPopUp: React.FC<ProgressPopUpProps> = ({
  label,
  labelTx,
  progress,
  ...rest
}) => (
  <ProgressPopUpContainer {...rest}>
    <ProgressTitle tx={labelTx} text={label} />
    <ProgressBarContainer>
      <ProgressBar progress={progress} />
    </ProgressBarContainer>
  </ProgressPopUpContainer>
);
