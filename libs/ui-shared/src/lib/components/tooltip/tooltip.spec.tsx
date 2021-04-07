import { render } from "@testing-library/react";
import React from "react";

import { Tooltip } from "./tooltip";

describe("Tooltip", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<Tooltip />);
    expect(baseElement).toBeTruthy();
  });
});
