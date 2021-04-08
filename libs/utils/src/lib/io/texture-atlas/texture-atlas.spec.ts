import { Vector } from "../../models/vector/vector";
import {
  convertAtlasToDataArray,
  convertDataArrayToAtlas,
} from "./texture-atlas";

describe("texture atlas conversion", () => {
  it("should convert a scalar 3D image from an data array and back", () => {
    const dataArray = new Uint8Array(32 * 32 * 32)
      .fill(0)
      .map((_value, index) => index);
    const metadata = {
      voxelComponents: 1,
      voxelCount: new Vector(3, false).setScalar(32),
    };

    expect(
      convertAtlasToDataArray(
        convertDataArrayToAtlas(dataArray.slice(), metadata),
        metadata,
      ),
    ).toEqual(dataArray);
  });

  it("should convert an RGBA 3D image from an data array and back", () => {
    const dataArray = new Uint8Array(32 * 32 * 32 * 4)
      .fill(0)
      .map((_value, index) => index);
    const metadata = {
      voxelComponents: 4,
      voxelCount: new Vector(3, false).setScalar(32),
    };

    expect(
      convertAtlasToDataArray(
        convertDataArrayToAtlas(dataArray.slice(), metadata),
        metadata,
      ),
    ).toEqual(dataArray);
  });
});
