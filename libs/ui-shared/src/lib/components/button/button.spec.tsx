import { render } from "@testing-library/react";
import React from "react";
import { ThemeProvider } from "styled-components";

import Button from "./button";
import { getTheme } from "../../theme";

describe("Button", () => {
  it("should render successfully", () => {
    const { baseElement } = render(
      <ThemeProvider theme={getTheme()}>
        <Button />
      </ThemeProvider>,
    );
    expect(baseElement).toBeTruthy();
  });
});
