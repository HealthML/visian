import {
  ColorMode,
  EnumParam,
  Switch,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";

import { useStore } from "../../../app/root-store";
import { SettingsPopUpProps } from "./settings-popup.props";
import {
  GroupTitle,
  GroupTitleContainer,
  SettingsColumn,
  SettingsColumnContainer,
  SettingsGroup,
  SettingsPopUpContainer,
} from "./styled-components";

// Settings Items
const themeSwitchOptions = [
  { value: "dark", labelTx: "dark" },
  { value: "light", labelTx: "light" },
];

const languageSwitchOptions = [
  { label: "English", value: "en" },
  { label: "Deutsch", value: "de" },
];

const voxelSwitchOptions = [
  { label: "On", value: true },
  { label: "Off", value: false },
];

const performanceSwitchOptions = [
  { label: "Low", value: "low" },
  { label: "High", value: "high" },
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
      <SettingsPopUpContainer
        titleTx="settings"
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        <SettingsColumnContainer>
          <SettingsColumn>
            <SettingsGroup>
              <GroupTitleContainer>
                <GroupTitle text="General" />
              </GroupTitleContainer>{" "}
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
              <Switch
                labelTx="voxelData"
                options={voxelSwitchOptions}
                value={store?.editor.activeDocument?.viewport2D.showVoxelInfo}
                onChange={
                  store?.editor.activeDocument?.viewport2D.setShowVoxelInfo
                }
              />
              <Switch
                labelTx="performanceMode"
                options={performanceSwitchOptions}
                value={store?.editor.performanceMode}
                onChange={store?.editor.setPerformanceMode}
              />
            </SettingsGroup>
          </SettingsColumn>
          <SettingsColumn />
          <SettingsColumn />
          <SettingsColumn />
        </SettingsColumnContainer>
      </SettingsPopUpContainer>
    );
  },
);
