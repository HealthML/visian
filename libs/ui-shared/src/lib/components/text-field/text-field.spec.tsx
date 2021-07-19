import { render } from "@testing-library/react";
import React from "react";

import { TextField } from "./text-field";

describe("TextField", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<TextField />);
    expect(baseElement).toBeTruthy();
  });
});
