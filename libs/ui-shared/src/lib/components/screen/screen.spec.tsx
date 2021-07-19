import { render } from "@testing-library/react";
import React from "react";

import Screen from "./screen";

describe("Screen", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<Screen title="test" />);
    expect(baseElement).toBeTruthy();
  });
});
