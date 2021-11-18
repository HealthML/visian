import {
  BooleanParam,
  ColorMode,
  EnumParam,
  LargePopUpColumn,
  LargePopUpColumnContainer,
  LargePopUpGroup,
  LargePopUpGroupTitle,
  LargePopUpGroupTitleContainer,
  PopUp,
  Switch,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { SettingsPopUpProps } from "./settings-popup.props";

const StyledPopUp = styled(PopUp)`
  width: 280px;
`;

// Settings Items
const themeSwitchOptions = [
  { value: "dark", labelTx: "dark" },
  { value: "light", labelTx: "light" },
];

const languageSwitchOptions = [
  { label: "English", value: "en" },
  { label: "Deutsch", value: "de" },
];

const performanceSwitchOptions = [
  { labelTx: "low", value: "low" },
  { labelTx: "high", value: "high" },
];

export const SettingsPopUp: React.FC<SettingsPopUpProps> = observer(
  ({ isOpen, onClose }) => {
    const store = useStore();
    // Menu Actions
    const setTheme = useCallback(
      (value: string) => {
        store?.setColorMode(value as ColorMode);
      },
      [store],
    );

    const { i18n } = useTranslation();
    const setLanguage = useCallback(
      (language: string) => {
        i18n.changeLanguage(language);
      },
      [i18n],
    );

    return (
      <StyledPopUp
        titleTx="settings"
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        <LargePopUpColumnContainer>
          <LargePopUpColumn>
            <LargePopUpGroup>
              <LargePopUpGroupTitleContainer>
                <LargePopUpGroupTitle text="General" />
              </LargePopUpGroupTitleContainer>
              <EnumParam
                labelTx="theme"
                options={themeSwitchOptions}
                value={store?.colorMode || "dark"}
                setValue={setTheme}
              />
              <EnumParam
                labelTx="language"
                options={languageSwitchOptions}
                value={i18n.language.split("-")[0]}
                setValue={setLanguage}
              />
              <BooleanParam
                labelTx="exclusive-segmentations"
                value={store?.editor.activeDocument?.useExclusiveAnnotations}
                setValue={
                  store?.editor.activeDocument?.setUseExclusiveAnnotations
                }
              />
              <BooleanParam
                labelTx="voxel-data"
                value={store?.editor.activeDocument?.viewport2D.showVoxelInfo}
                setValue={
                  store?.editor.activeDocument?.viewport2D.setShowVoxelInfo
                }
              />
              <Switch
                labelTx="performance-mode"
                options={performanceSwitchOptions}
                value={store?.editor.performanceMode}
                onChange={store?.editor.setPerformanceMode}
              />
            </LargePopUpGroup>
          </LargePopUpColumn>
        </LargePopUpColumnContainer>
      </StyledPopUp>
    );
  },
);
