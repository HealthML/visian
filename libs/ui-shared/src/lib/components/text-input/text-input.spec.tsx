import { render } from "@testing-library/react";
import React from "react";

import { TextInput } from "./text-input";

describe("TextInput", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<TextInput />);
    expect(baseElement).toBeTruthy();
  });
});
