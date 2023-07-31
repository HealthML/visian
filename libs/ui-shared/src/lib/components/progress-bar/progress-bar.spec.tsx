import { render } from "@testing-library/react";
import React from "react";

import { ProgressBar } from "./progress-bar";

describe("ProgressBar", () => {
  it("should render successfully", () => {
    const { baseElement } = render(
      <ProgressBar total={120} totalLabel="All Items" bars={[]} />,
    );
    expect(baseElement).toBeTruthy();
  });
});
