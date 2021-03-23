import { render } from "@testing-library/react";
import React from "react";

import IntervalSlider from "./interval-slider";

describe("IntervalSlider", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<IntervalSlider />);
    expect(baseElement).toBeTruthy();
  });
});
