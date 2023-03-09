import { render } from "@testing-library/react";
import React from "react";

import { StatusBadge } from "./status-badge";

describe("Status Badge", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<StatusBadge color={"red"} text={"Test"} />);
    expect(baseElement).toBeTruthy();
  });
});
