import { Vector, ViewType } from "@visian/utils";
import { MergeFunction } from "../types";

import { AtlasWriter } from "./atlas-writer";
import { SliceReader } from "./slice-reader";
import { SliceWriter } from "./slice-writer";

export class AtlasAdapter {
  private sliceReader: SliceReader;
  private sliceWriter: SliceWriter;
  private atlasWriter = new AtlasWriter();

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

  public invalidateCache() {
    this.sliceReader.invalidateCache();
  }

  public readSlice(
    sliceNumber: number,
    viewType: ViewType,
    renderer: THREE.WebGLRenderer,
  ) {
    return this.sliceReader.readSlice(sliceNumber, viewType, renderer);
  }

  public readSliceToTarget(
    sliceNumber: number,
    viewType: ViewType,
    renderer: THREE.WebGLRenderer,
    target: THREE.WebGLRenderTarget,
    atlasTexture: THREE.Texture,
  ) {
    this.sliceReader.readSliceToTarget(
      sliceNumber,
      viewType,
      renderer,
      target,
      atlasTexture,
    );
  }

  public writeSlice(
    sliceNumber: number,
    viewType: ViewType,
    sliceData: Uint8Array | THREE.Texture[] | undefined,
    renderTargets: THREE.WebGLRenderTarget[],
    renderers: THREE.WebGLRenderer[],
    mergeFunction: MergeFunction,
  ) {
    return this.sliceWriter.writeSlice(
      sliceNumber,
      viewType,
      sliceData,
      renderTargets,
      renderers,
      mergeFunction,
    );
  }

  public addToAltas(
    data: THREE.Texture[],
    threshold: number,
    renderTargets: THREE.WebGLRenderTarget[],
    renderers: THREE.WebGLRenderer[],
  ) {
    this.atlasWriter.addToAltas(data, threshold, renderTargets, renderers);
  }
}
