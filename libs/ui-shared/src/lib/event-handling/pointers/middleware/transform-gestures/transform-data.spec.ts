import { Pointer } from "../../types";
import { TransformData } from "./transform-data";

describe("TransformData", () => {
  it("should create a new set of transform data", () => {
    const transformData = new TransformData();
    expect(transformData.translateX).toBe(0);
    expect(transformData.translateY).toBe(0);
    expect(transformData.scale).toBe(1);
    expect(transformData.twist).toBe(0);

    const transformData2 = new TransformData(128, 0, 2, 45);
    expect(transformData2.translateX).toBe(128);
    expect(transformData2.translateY).toBe(0);
    expect(transformData2.scale).toBe(2);
    expect(transformData2.twist).toBe(45);

    const transformData3 = new TransformData(0, 0, 0, 0);
    expect(transformData3.translateX).toBe(0);
    expect(transformData3.translateY).toBe(0);
    expect(transformData3.scale).toBe(1);
    expect(transformData3.twist).toBe(0);
  });

  it("should generate transform data from an array of pointers", () => {
    const transformData = TransformData.fromPointers([
      new Pointer(
        "uuid",
        {
          buttons: 1,
          clientX: 256,
          clientY: 64,
          pressure: 1,
          scale: 1.2,
          tiltX: 0,
          tiltY: 0,
          twist: 0,
        },
        { device: "mouse", identifier: "mouse", startTime: 0 },
      ),
    ]);

    expect(transformData.translateX).toBe(256);
    expect(transformData.translateY).toBe(64);
    expect(transformData.scale).toBe(1.2);
    expect(transformData.twist).toBe(0);

    const transformData2 = TransformData.fromPointers([
      new Pointer(
        "uuid",
        {
          buttons: 1,
          clientX: 0,
          clientY: 0,
          pressure: 1,
          tiltX: 0,
          tiltY: 0,
          twist: 0,
        },
        { device: "touch", identifier: "t/0", startTime: 0 },
      ),
      new Pointer(
        "uuid",
        {
          buttons: 1,
          clientX: 128,
          clientY: 128,
          pressure: 1,
          tiltX: 0,
          tiltY: 0,
          twist: 0,
        },
        { device: "touch", identifier: "t/1", startTime: 0 },
      ),
    ]);

    expect(transformData2.translateX).toBe(64);
    expect(transformData2.translateY).toBe(64);
    expect(transformData2.scale).toBeCloseTo(90.5097);
    // TODO: Rotation
  });

  it("should create a new set of identical transform values", () => {
    const transformData = new TransformData(54, 33, 98, 0);
    const transformData2 = transformData.clone();
    expect(transformData2).not.toBe(transformData);
    expect(transformData2.translateX).toBe(transformData.translateX);
    expect(transformData2.translateY).toBe(transformData.translateY);
    expect(transformData2.scale).toBe(transformData.scale);
    expect(transformData2.twist).toBe(transformData.twist);
  });

  it("should invert the transform data", () => {
    const transformData = new TransformData().invert();
    expect(transformData.translateX).toBe(0);
    expect(transformData.translateY).toBe(0);
    expect(transformData.scale).toBe(1);
    expect(transformData.twist).toBe(0);

    const transformData2 = new TransformData(128, 0, 2, 45).invert();
    expect(transformData2.translateX).toBe(-128);
    expect(transformData2.translateY).toBe(0);
    expect(transformData2.scale).toBe(0.5);
    expect(transformData2.twist).toBe(-45);
  });

  it("should add two sets of transform data", () => {
    const transformData = new TransformData().add(
      new TransformData(128, 0, 2, 45),
    );
    expect(transformData.translateX).toBe(128);
    expect(transformData.translateY).toBe(0);
    expect(transformData.scale).toBe(2);
    expect(transformData.twist).toBe(45);

    const transformData2 = transformData.add(new TransformData(0, 12));
    expect(transformData2.translateX).toBe(128);
    expect(transformData2.translateY).toBe(12);
    expect(transformData2.scale).toBe(2);
    expect(transformData2.twist).toBe(45);
    expect(transformData2).toBe(transformData);
  });

  it("should subtract two sets of transform data", () => {
    const transformData = new TransformData().subtract(
      new TransformData(128, 0, 2, 45),
    );
    expect(transformData.translateX).toBe(-128);
    expect(transformData.translateY).toBe(0);
    expect(transformData.scale).toBe(0.5);
    expect(transformData.twist).toBe(-45);

    const transformData2 = transformData.subtract(new TransformData(0, 12));
    expect(transformData2.translateX).toBe(-128);
    expect(transformData2.translateY).toBe(-12);
    expect(transformData2.scale).toBe(0.5);
    expect(transformData2.twist).toBe(-45);
    expect(transformData2).toBe(transformData);
  });

  it("should set the transform data's values", () => {
    const transformData = new TransformData().set(
      new TransformData(128, 0, 2, 45),
    );
    expect(transformData.translateX).toBe(128);
    expect(transformData.translateY).toBe(0);
    expect(transformData.scale).toBe(2);
    expect(transformData.twist).toBe(45);

    const transformData2 = transformData
      .set({ twist: 90 })
      .set({ scale: 0 })
      .set({});
    expect(transformData2.translateX).toBe(128);
    expect(transformData2.translateY).toBe(0);
    expect(transformData2.scale).toBe(1);
    expect(transformData2.twist).toBe(90);
    expect(transformData2).toBe(transformData);
  });

  it("should counter the perceived displacement from a zoom", () => {
    expect(
      new TransformData(0, 0, 2, 0).counterZoomOffset(new TransformData()),
    ).toEqual(new TransformData(0, 0, 2, 0));

    expect(
      new TransformData(0, 0, 2, 0).counterZoomOffset(
        new TransformData(128, 128),
      ),
    ).toEqual(new TransformData(-128, -128, 2, 0));

    expect(
      new TransformData(0, 0, 2, 0).counterZoomOffset(
        new TransformData(128, 128),
        new TransformData(256, 256),
      ),
    ).toEqual(new TransformData(128, 128, 2, 0));
  });
});
