import { render } from "@testing-library/react";
import React from "react";

import { Progress } from "./progress";

describe("Progress", () => {
  it("should render successfully", () => {
    const { baseElement } = render(
      <Progress total={120} totalLabel="All Items" bars={[]} />,
    );
    expect(baseElement).toBeTruthy();
  });
});
