/* eslint-disable react/jsx-filename-extension */
import React, { useEffect } from "react";
import styled from "styled-components";

import { i18n, I18nProvider, initI18n, useTranslation } from "../src/lib/i18n";
import { getTheme, GlobalStyles, ThemeProvider } from "../src/lib/theme";

const resources = {
  en: {
    translation: {
      __test: "Welcome to React and react-i18next!",
      date: "{{date, YYYY-MM-DD}}",
    },
  },
  de: {
    translation: {
      __test: "Willkommen zu React und react-i18next!",
      date: "{{date, DD.MM.YYYY}}",
    },
  },
};
initI18n(resources);

export const globalTypes = {
  theme: {
    name: "Theme",
    description: "Global theme for components",
    defaultValue: "light",
    toolbar: {
      icon: "circlehollow",
      items: ["light", "dark"],
    },
  },
  language: {
    name: "Language",
    description: "The current language",
    defaultValue: i18n.language,
    toolbar: {
      icon: "globe",
      items: ["en", "de", "cimode"],
    },
  },
};

export const parameters = {
  layout: "fullscreen",
  backgrounds: {
    disable: true,
  },
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  touch-action: none;
  width: 100%;
`;

const WithThemeProvider = (Story, { globals }) => {
  const { i18n: instance } = useTranslation();
  useEffect(() => {
    instance.changeLanguage(globals.language);
  }, [globals.language, instance]);

  return (
    <I18nProvider i18n={instance}>
      <ThemeProvider theme={getTheme(globals.theme)}>
        <StyledContainer>
          <GlobalStyles />
          <Story />
        </StyledContainer>
      </ThemeProvider>
    </I18nProvider>
  );
};
export const decorators = [WithThemeProvider];
