import { color, FlexColumn, Sheet } from "@visian/ui-shared";
import React from "react";
import styled from "styled-components";
import { ProgressPopUp } from "../progress-popup";

import { ReactComponent as VisianLogoImage } from "./Visian Logo White.svg";
import { ReactComponent as HPILogoImage } from "./HPI Logo Visian Style.svg";
import SplashScreenImage from "./SplashScreenImage.png";

const SplashScreenContainer = styled(FlexColumn)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  overflow: visible;
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

const ProgressPopUpDummy = styled(Sheet)`
  align-items: center;
  justify-content: center;
  width: 500px;
  height: 100px;
`;

const SplashScreenBackground = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: ${color("background")};
  z-index: 100;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
`;

const VisianLogo = styled(VisianLogoImage)`
  width: 80px;
  height: Auto;
  position: absolute;
  top: 28px;
  left: 28px;
`;

const HPILogo = styled(HPILogoImage)`
  width: 80px;
  height: Auto;
  position: absolute;
  bottom: 24px;
  left: 28px;
`;

const SplashImage = styled.img`
  height: 90%;
  width: Auto;
  position: absolute;
  right: 0;
  bottom: 0;
`;

const ProgressPopUpSplash = styled(ProgressPopUp)`
  position: static;
`;

export const SplashScreen: React.FC = () => (
  <SplashScreenContainer>
    <SplashContainer>
      <VisianLogo />
      <HPILogo />
      <SplashImage src={SplashScreenImage} />
    </SplashContainer>
    <ProgressPopUpSplash label="Importing" />
  </SplashScreenContainer>
);
