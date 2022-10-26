import { TransformData } from "./transform-data";
import { TransformGesture } from "./transform-gesture";

describe("TransformGesture", () => {
  it("should create a new gesture", () => {
    expect(new TransformGesture().context).toEqual({});

    expect(
      new TransformGesture(new TransformData(24, 256, 1, 0)).getDelta(),
    ).toEqual(new TransformData(0, 0, 1, 0));

    expect(
      new TransformGesture(new TransformData(24, 256, 1, 0)).getTarget(),
    ).toEqual(new TransformData(24, 256, 1, 0));

    expect(
      new TransformGesture(new TransformData(), { key: "value" }).context.key,
    ).toBe("value");
  });

  it("should compute the offset to a new target", () => {
    const gesture = new TransformGesture(new TransformData(0, 256, 1, 0));
    gesture.setTarget(new TransformData(64, 128, 4, -45));
    expect(gesture.getDelta()).toEqual(new TransformData(64, -128, 4, -45));
  });

  // TODO: Test `getTransformed()`

  // TODO: Test `rebase()`

  // TODO: Test `setStartTransform()`
});
