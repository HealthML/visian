import { render } from "@testing-library/react";
import React from "react";

import DropZone from "./drop-zone";

describe("DropZone", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<DropZone />);
    expect(baseElement).toBeTruthy();
  });
});
