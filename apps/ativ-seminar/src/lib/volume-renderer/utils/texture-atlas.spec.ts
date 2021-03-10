import * as THREE from "three";

import TextureAtlas from "./texture-atlas";

describe("TextureAtlas", () => {
  it("should convert I/O format data to an atlas and back", () => {
    const data = new Uint32Array(128 * 128 * 128).map((_d, i) => i);

    const textureAtlas = new TextureAtlas(
      new THREE.Vector3().setScalar(128),
    ).setData(data.slice());

    expect(textureAtlas.setAtlas(textureAtlas.getAtlas()).getData()).toEqual(
      data,
    );
  });
});
