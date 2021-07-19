import { render } from "@testing-library/react";
import React from "react";

import WebGLCanvas from "./webgl-canvas";

describe("Box", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<WebGLCanvas />);
    expect(baseElement).toBeTruthy();
  });
});
