import { render } from "@testing-library/react";
import React from "react";

import Text from "./text";

describe("Text", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<Text />);
    expect(baseElement).toBeTruthy();
  });
});
