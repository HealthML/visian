import { render } from "@testing-library/react";
import React from "react";

import Sheet from "./sheet";

describe("Sheet", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<Sheet />);
    expect(baseElement).toBeTruthy();
  });
});
