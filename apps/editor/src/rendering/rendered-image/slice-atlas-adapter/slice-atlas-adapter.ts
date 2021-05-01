import { Vector, ViewType } from "@visian/utils";

import { SliceReader } from "./slice-reader";
import { SliceWriter } from "./slice-writer";

export class SliceAtlasAdapter {
  private sliceReader: SliceReader;
  private sliceWriter: SliceWriter;

  constructor(
    atlasTexture: THREE.Texture,
    atlasGrid: Vector,
    voxelCount: Vector,
    components: number,
    atlasViewType = ViewType.Transverse,
  ) {
    this.sliceReader = new SliceReader(
      atlasTexture,
      atlasGrid,
      voxelCount,
      components,
    );
    this.sliceWriter = new SliceWriter(voxelCount, components, atlasViewType);
  }

  public readSlice(
    sliceNumber: number,
    viewType: ViewType,
    renderer: THREE.WebGLRenderer,
  ) {
    return this.sliceReader.readSlice(sliceNumber, viewType, renderer);
  }

  public writeSlice(
    sliceNumber: number,
    viewType: ViewType,
    sliceData: Uint8Array | undefined,
    renderTargets: THREE.WebGLRenderTarget[],
    renderers: THREE.WebGLRenderer[],
  ) {
    return this.sliceWriter.writeSlice(
      sliceNumber,
      viewType,
      sliceData,
      renderTargets,
      renderers,
    );
  }
}
