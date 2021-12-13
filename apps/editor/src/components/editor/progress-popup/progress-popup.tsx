import { color, PopUp, Text } from "@visian/ui-shared";
import React from "react";
import styled, { css, keyframes } from "styled-components";

import { IS_FLOY_DEMO } from "../../../constants";
import { ReactComponent as HPILogoImage } from "./hpi-logo.svg";
import { ProgressPopUpProps } from "./progress-popup.props";
import SplashScreenImage from "./splash.png";
import { ReactComponent as VisianLogoImage } from "./visian-logo.svg";
import { ReactComponent as VisianHPILogoImage } from "./visian-hpi-logo.svg";
import { ReactComponent as FloyLogoImage } from "./floy-logo.svg";

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

const SplashContainer = styled.div`
  width: 500px;
  height: 260px;
  position: relative;
  border: 1px solid ${color("sheetBorder")};
  border-radius: 10px;
  margin-bottom: 20px;
  background-color: ${color("background")};
`;

const VisianLogo = styled(VisianLogoImage)`
  width: 80px;
  height: auto;
  position: absolute;
  top: 28px;
  left: 28px;
`;

const FloyLogo = styled(FloyLogoImage)`
  width: 140px;
  height: auto;
  position: absolute;
  top: 28px;
  left: 28px;
`;

const HPILogo = styled(HPILogoImage)`
  width: 80px;
  height: auto;
  position: absolute;
  bottom: 24px;
  left: 28px;
`;

const VisianHPILogo = styled(VisianHPILogoImage)`
  width: 70px;
  height: auto;
  position: absolute;
  bottom: 24px;
  left: 28px;
`;

const SplashImage = styled.img`
  height: 90%;
  width: auto;
  position: absolute;
  right: 0;
  bottom: 0;
`;

export const ProgressPopUp: React.FC<ProgressPopUpProps> = ({
  label,
  labelTx,
  progress,
  showSplash,
  ...rest
}) => (
  <ProgressPopUpContainer
    childrenBefore={
      showSplash && !IS_FLOY_DEMO ? (
        <SplashContainer>
          {IS_FLOY_DEMO ? (
            <>
              <FloyLogo />
              <VisianHPILogo />
            </>
          ) : (
            <>
              <VisianLogo />
              <HPILogo />
            </>
          )}
          <SplashImage src={SplashScreenImage} />
        </SplashContainer>
      ) : null
    }
    {...rest}
  >
    <ProgressTitle tx={labelTx} text={label} />
    <ProgressBarContainer>
      <ProgressBar progress={progress} />
    </ProgressBarContainer>
  </ProgressPopUpContainer>
);
