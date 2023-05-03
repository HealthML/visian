import { MergeFunction } from "@visian/ui-shared";
import {
  getPlaneAxes,
  IDisposable,
  Image,
  setSlice,
  ViewType,
  viewTypes,
} from "@visian/utils";
import * as THREE from "three";

import { ScreenAlignedQuad } from "../../screen-aligned-quad";
import { OrientedSlice } from "../types";
import { getTextureFormat } from "../utils";
import { MergeMaterial, MergeMaterial3D } from "./merge-material";
import { ReadSliceMaterial } from "./read-slice-material";
import { SliceLine } from "./slice-line";

export class TextureAdapter implements IDisposable {
  private mergeMaterial = new MergeMaterial();
  private mergeMaterial3D = new MergeMaterial3D();
  private quad: ScreenAlignedQuad;
  private sliceLine: SliceLine;

  private sliceTextures: THREE.DataTexture[];
  private sliceData: Uint8Array[] = [];

  private readSliceMaterial: ReadSliceMaterial;
  private readRenderTarget: THREE.WebGLRenderTarget;
  private lastReadViewType: ViewType;
  private copyMaterial = new THREE.MeshBasicMaterial();

  private sliceCache?: {
    sliceNumber: number;
    viewType: ViewType;
    sliceData: Uint8Array;
  };

  constructor(
    private image: Pick<
      Image,
      "voxelCount" | "voxelComponents" | "is3D" | "defaultViewType"
    >,
  ) {
    this.quad = new ScreenAlignedQuad(this.mergeMaterial);
    this.sliceLine = new SliceLine(this.mergeMaterial, image.voxelCount);

    this.sliceTextures = viewTypes.map((viewType) => {
      const [widthAxis, heightAxis] = getPlaneAxes(viewType);
      const width = image.voxelCount[widthAxis];
      const height = image.voxelCount[heightAxis];

      this.sliceData[viewType] = new Uint8Array(
        image.voxelComponents * width * height,
      );

      const texture = new THREE.DataTexture(
        this.sliceData[viewType],
        width,
        height,
        getTextureFormat(image.voxelComponents),
      );
      texture.needsUpdate = true;
      return texture;
    });

    this.readSliceMaterial = new ReadSliceMaterial(image.voxelCount);
    this.readRenderTarget = new THREE.WebGLRenderTarget(
      image.voxelCount.x,
      image.voxelCount.y,
    );
    this.lastReadViewType = ViewType.Transverse;
  }

  public dispose() {
    this.sliceTextures.forEach((texture) => texture.dispose());
    this.readRenderTarget.dispose();
    this.copyMaterial.dispose();
    this.mergeMaterial.dispose();
    this.mergeMaterial3D.dispose();
    this.readSliceMaterial.dispose();
    this.quad.dispose();
    this.sliceLine.dispose();
  }

  public readImage(
    renderer: THREE.WebGLRenderer,
    source: THREE.Texture,
    inPlaceBuffer?: Uint8Array,
  ) {
    const bufferLength =
      this.image.voxelCount.product() * this.image.voxelComponents;

    if (inPlaceBuffer && inPlaceBuffer.length !== bufferLength) {
      throw new Error("Wrong buffer length to read data.");
    }

    const buffer = inPlaceBuffer ?? new Uint8Array(bufferLength);

    if (this.image.is3D) {
      const sliceOffset =
        this.image.voxelCount.x *
        this.image.voxelCount.y *
        this.image.voxelComponents;
      for (let slice = 0; slice < this.image.voxelCount.z; slice++) {
        buffer.set(
          this.readSlice(slice, ViewType.Transverse, renderer, source),
          slice * sliceOffset,
        );
      }

      return buffer;
    }

    const image = this.readSlice(
      0,
      this.image.defaultViewType,
      renderer,
      source,
    );
    if (!inPlaceBuffer) return image;

    inPlaceBuffer.set(image);
    return inPlaceBuffer;
  }

  public readSlices(
    slices: OrientedSlice[],
    renderer: THREE.WebGLRenderer,
    source: THREE.Texture,
    buffer: Uint8Array,
  ) {
    const sliceOffset =
      this.image.voxelCount.x *
      this.image.voxelCount.y *
      this.image.voxelComponents;

    slices.forEach(({ slice, viewType }) => {
      const sliceData = this.readSlice(slice, viewType, renderer, source);
      if (viewType === ViewType.Transverse) {
        buffer.set(sliceData, slice * sliceOffset);
        return;
      }

      setSlice(this.image, buffer, viewType, slice, sliceData);
    });
  }

  public writeImage(
    source: THREE.Texture,
    target: THREE.WebGLRenderTarget,
    renderer: THREE.WebGLRenderer,
    mergeFunction: MergeFunction,
    threshold?: number,
  ) {
    if (!this.image.is3D) {
      return this.writeSlice(
        0,
        this.image.defaultViewType,
        source,
        target,
        renderer,
        mergeFunction,
        threshold,
      );
    }

    this.quad.material = this.mergeMaterial3D;
    this.mergeMaterial3D.setSource(source);
    this.mergeMaterial3D.setMergeFunction(mergeFunction);
    this.mergeMaterial3D.setThreshold(threshold);
    renderer.autoClear = false;
    for (let slice = 0; slice < this.image.voxelCount.z; slice++) {
      renderer.setRenderTarget(target, slice);
      this.mergeMaterial3D.setSlice(slice, this.image.voxelCount.z);
      this.quad.renderWith(renderer);
    }
    renderer.setRenderTarget(null);
    renderer.autoClear = true;
  }

  public writeSlice(
    sliceNumber: number,
    viewType: ViewType,
    sliceData: Uint8Array | THREE.Texture | undefined,
    target: THREE.WebGLRenderTarget,
    renderer: THREE.WebGLRenderer,
    mergeFunction: MergeFunction,
    threshold?: number,
  ) {
    const textureData = this.sliceData[viewType];
    if (sliceData) {
      if (sliceData instanceof Uint8Array) {
        if (sliceData.length !== textureData.length) {
          throw new Error("Provided data is not of the correct length.");
        }

        textureData.set(sliceData);
        this.sliceTextures[viewType].needsUpdate = true;
      }
    } else {
      textureData.fill(0);
      this.sliceTextures[viewType].needsUpdate = true;
    }

    this.mergeMaterial.setMergeFunction(mergeFunction);
    this.mergeMaterial.setThreshold(threshold);

    if (viewType === ViewType.Transverse || !this.image.is3D) {
      this.quad.material = this.mergeMaterial;
      this.mergeMaterial.setSource(
        sliceData instanceof Uint8Array || !sliceData
          ? this.sliceTextures[viewType]
          : sliceData,
      );
      renderer.autoClear = false;
      renderer.setRenderTarget(
        target,
        this.image.is3D ? sliceNumber : undefined,
      );
      this.quad.renderWith(renderer);
      renderer.setRenderTarget(null);
      renderer.autoClear = true;

      return;
    }

    this.sliceLine.setSourceSlice(sliceNumber, viewType);
    this.mergeMaterial.setSource(
      sliceData instanceof Uint8Array || !sliceData
        ? this.sliceTextures[viewType]
        : sliceData,
    );
    renderer.autoClear = false;
    for (
      let targetSlice = 0;
      targetSlice < this.image.voxelCount.z;
      targetSlice++
    ) {
      renderer.setRenderTarget(target, targetSlice);
      this.sliceLine.setTargetSlice(targetSlice);
      renderer.render(this.sliceLine, this.sliceLine.camera);
    }
    renderer.setRenderTarget(null);
    renderer.autoClear = true;
  }

  public invalidateCache() {
    this.sliceCache = undefined;
  }

  public readSliceToTarget(
    sliceNumber: number,
    viewType: ViewType,
    renderer: THREE.WebGLRenderer,
    source: THREE.Texture,
    target = this.readRenderTarget,
  ) {
    if (this.image.is3D) {
      this.readSliceMaterial.setSliceNumber(sliceNumber);
      this.readSliceMaterial.setViewType(viewType);
      this.readSliceMaterial.setDataTexture(source);

      this.quad.material = this.readSliceMaterial;
    } else {
      this.copyMaterial.map = source;

      this.quad.material = this.copyMaterial;
    }

    renderer.setRenderTarget(target);
    this.quad.renderWith(renderer);
    renderer.setRenderTarget(null);
  }

  public readSlice(
    sliceNumber: number,
    viewType: ViewType,
    renderer: THREE.WebGLRenderer,
    source: THREE.Texture,
  ) {
    if (
      this.sliceCache &&
      this.sliceCache.sliceNumber === sliceNumber &&
      this.sliceCache.viewType === viewType
    ) {
      return this.sliceCache.sliceData;
    }

    const [widthAxis, heightAxis] = getPlaneAxes(viewType);
    const width = this.image.voxelCount[widthAxis];
    const height = this.image.voxelCount[heightAxis];

    if (this.lastReadViewType !== viewType) {
      this.readRenderTarget.setSize(width, height);
      this.lastReadViewType = viewType;
    }

    this.readSliceToTarget(
      sliceNumber,
      viewType,
      renderer,
      source,
      this.readRenderTarget,
    );

    // Read slice from render target.
    const buffer = new Uint8Array(width * height * 4);
    renderer.readRenderTargetPixels(
      this.readRenderTarget,
      0,
      0,
      width,
      height,
      buffer,
    );

    if (this.image.voxelComponents === 4) {
      this.sliceCache = {
        sliceNumber,
        viewType,
        sliceData: buffer,
      };

      return buffer;
    }

    // Read components.
    const slice = new Uint8Array(width * height * this.image.voxelComponents);
    for (let i = 0; i < width * height; i++) {
      for (let c = 0; c < this.image.voxelComponents; c++) {
        slice[this.image.voxelComponents * i + c] = buffer[4 * i + c];
      }
    }

    this.sliceCache = {
      sliceNumber,
      viewType,
      sliceData: slice,
    };

    return slice;
  }
}
