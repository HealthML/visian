/* eslint-disable react/jsx-filename-extension */
import { useEffect } from "react";
import styled from "styled-components";

import { ModalRoot } from "../src/lib/components";
import { i18n, I18nProvider, initI18n, useTranslation } from "../src/lib/i18n";
import { getTheme, GlobalStyles, ThemeProvider } from "../src/lib/theme";

const resources = {
  en: {
    common: {
      __test: "Welcome to React and react-i18next!",
      styled: "Welcome to <b>React</b> and <i>react-i18next</i>!",
    },
  },
  de: {
    common: {
      __test: "Willkommen zu React und react-i18next!",
      styled: "Willkommen zu <b>React</b> und <i>react-i18next</i>!",
    },
  },
};
initI18n({ resources });

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
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  layout: "fullscreen",
  backgrounds: {
    disable: true,
  },
};

const Wrapper = styled.div`
  height: 100%;
  overflow: auto;
  width: 100%;
`;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 100%;
  touch-action: none;
  width: 100%;
`;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const WithThemeProvider = (Story, { globals }) => {
  const { i18n: instance } = useTranslation();
  useEffect(() => {
    instance.changeLanguage(globals.language);
  }, [globals.language, instance]);

  return (
    <I18nProvider i18n={instance}>
      <ThemeProvider theme={getTheme(globals.theme)}>
        <Wrapper>
          <StyledContainer>
            <GlobalStyles />
            <ModalRoot />
            <Story />
          </StyledContainer>
        </Wrapper>
      </ThemeProvider>
    </I18nProvider>
  );
};
export const decorators = [WithThemeProvider];
