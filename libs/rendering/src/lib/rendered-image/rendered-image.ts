import { IDocument, MergeFunction } from "@visian/ui-shared";
import {
  getPlaneAxes,
  IDisposable,
  Image,
  ImageSnapshot,
  TypedArray,
  Vector,
  ViewType,
  Voxel,
  // eslint-disable-next-line unused-imports/no-unused-imports
  VoxelTypes,
} from "@visian/utils";
import * as THREE from "three";

import { getInternalTextureFormat } from ".";
import { ImageRenderTarget } from "./image-render-target";
import { TextureAdapter } from "./texture-adapter";
import { OrientedSlice } from "./types";
import { getTextureFormat } from "./utils";

export class RenderedImage extends Image implements IDisposable {
  public excludeFromSnapshotTracking = ["document"];

  /**
   * If this image is an annotation:
   *    `internalTexture[THREE.NearestFilter]` is used to update the render target texture from the CPU.
   *
   * If this image is not an annotation:
   *    `internalTexture[THREE.NearestFilter]` and `internalTexture[THREE.LinearFilter]` are used as the main textures.
   * */
  private internalTexture: Record<
    THREE.TextureFilter,
    THREE.DataTexture3D | THREE.DataTexture
  >;

  /**
   * Sadly, Three currently does not let you change the filtering mode of a render target's
   * texture on the fly. As we need textures with nearest filtering for the 2D view and
   * linear filtering for the 3D view, we hold render targets for both filters.
   * See https://github.com/mrdoob/three.js/issues/14375
   * */
  private renderTargets: Record<THREE.TextureFilter, ImageRenderTarget>;
  /**
   * Whether or not the corresponding render target needs to be updated from the CPU data.
   * See @member renderTargets for texture filter explanation.
   */
  private hasCPUUpdates: Record<THREE.TextureFilter, boolean> = {
    [THREE.NearestFilter]: true,
    [THREE.LinearFilter]: true,
  };

  /** Callbacks to be invoked when `renderer` is set. */
  private rendererCallbacks: (() => void)[] = [];

  private gpuUpdates: OrientedSlice[] = [];
  private hasWholeTextureChanged = false;

  /** Reflects the content of `Image.data`, but is normalized to a Uint8Array as it is used on the GPU. */
  private textureData: Uint8Array;
  private isTextureDataDirty = true;

  private isDataDirty = false;

  public textureAdapter: TextureAdapter;

  constructor(
    image: ImageSnapshot & Pick<ImageSnapshot, "voxelCount" | "data">,
    protected document: IDocument,
    // Defines wheter or not this image can be edited on the GPU.
    protected isAnnotation: boolean,
  ) {
    super(image);

    this.textureData = new Uint8Array(
      this.voxelCount.product() * this.voxelComponents,
    );

    this.internalTexture = {};

    const textureFormat = getTextureFormat(this.voxelComponents);

    const textureData = this.getTextureData();

    const bytesPerElement = textureData.BYTES_PER_ELEMENT;
    const textureType =
      bytesPerElement === 1 ? THREE.UnsignedByteType : THREE.FloatType;
    const internalTextureFormat = getInternalTextureFormat(
      this.voxelComponents,
      bytesPerElement,
    );

    if (this.is3D) {
      const nearestTexture = new THREE.DataTexture3D(
        textureData,
        this.voxelCount.x,
        this.voxelCount.y,
        this.voxelCount.z,
      );
      nearestTexture.magFilter = THREE.NearestFilter;
      nearestTexture.format = textureFormat;
      nearestTexture.type = textureType;
      nearestTexture.internalFormat = internalTextureFormat;

      this.internalTexture[THREE.NearestFilter] = nearestTexture;

      if (!isAnnotation) {
        const linearTexture = new THREE.DataTexture3D(
          textureData,
          this.voxelCount.x,
          this.voxelCount.y,
          this.voxelCount.z,
        );
        linearTexture.magFilter = THREE.LinearFilter;
        linearTexture.minFilter = THREE.LinearFilter;
        linearTexture.format = textureFormat;
        linearTexture.type = textureType;
        linearTexture.internalFormat = internalTextureFormat;

        this.internalTexture[THREE.LinearFilter] = linearTexture;
      }
    } else {
      const [widthAxis, heightAxis] = getPlaneAxes(this.defaultViewType);
      const nearestTexture = new THREE.DataTexture(
        textureData,
        this.voxelCount[widthAxis],
        this.voxelCount[heightAxis],
        textureFormat,
        textureType,
        undefined,
        undefined,
        undefined,
        THREE.NearestFilter,
        THREE.NearestFilter,
      );

      nearestTexture.internalFormat = internalTextureFormat;

      this.internalTexture[THREE.NearestFilter] = nearestTexture;

      if (!isAnnotation) {
        const linearTexture = new THREE.DataTexture(
          textureData,
          this.voxelCount[widthAxis],
          this.voxelCount[heightAxis],
          textureFormat,
          textureType,
          undefined,
          undefined,
          undefined,
          THREE.LinearFilter,
          THREE.LinearFilter,
        );

        linearTexture.internalFormat = internalTextureFormat;

        this.internalTexture[THREE.LinearFilter] = linearTexture;
      }
    }

    this.renderTargets = isAnnotation
      ? {
          [THREE.NearestFilter]: new ImageRenderTarget(
            this,
            THREE.NearestFilter,
          ),
          [THREE.LinearFilter]: new ImageRenderTarget(this, THREE.LinearFilter),
        }
      : {};

    this.textureAdapter = new TextureAdapter(this);
  }

  public dispose() {
    this.textureAdapter.dispose();
    this.internalTexture[THREE.NearestFilter].dispose();
    this.internalTexture[THREE.LinearFilter]?.dispose();
    this.renderTargets[THREE.NearestFilter]?.dispose();
    this.renderTargets[THREE.LinearFilter]?.dispose();
  }

  /** Whether or not the texture data needs to be pulled from the GPU. */
  private get hasGPUUpdates(): boolean {
    return this.hasWholeTextureChanged || this.gpuUpdates.length > 0;
  }

  public getTextureData() {
    if (!this.isAnnotation) return this.getData();

    if (this.hasGPUUpdates) {
      this.pullDataFromGPU();
    }

    if (this.isTextureDataDirty) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maxValue = (this.getData() as any).reduce(
        (a: number, b: number) => Math.max(a, b),
        0,
      );

      const textureData = new Uint8Array(
        this.getData().map((value: number) =>
          Math.round((Math.max(0, value) / maxValue) * 255),
        ),
      );

      this.textureData.set(textureData);

      this.isTextureDataDirty = false;
    }

    return this.textureData;
  }

  public getData() {
    if (this.isDataDirty) {
      if (this.hasGPUUpdates) {
        this.pullDataFromGPU();
      }
      super.getData().set(this.textureData);

      this.isDataDirty = false;
    }

    return super.getData();
  }

  public getTexture(filter = THREE.NearestFilter) {
    return this.isAnnotation
      ? this.renderTargets[filter].texture
      : this.internalTexture[filter];
  }

  public waitForRenderer() {
    if (this.document.renderer || !this.isAnnotation) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.rendererCallbacks.push(resolve);
    });
  }

  public render() {
    if (!this.document.renderer || !this.isAnnotation) return;

    this.rendererCallbacks.forEach((callback) => callback());

    [THREE.NearestFilter, THREE.LinearFilter].forEach((filter) => {
      if (this.hasCPUUpdates[filter] && this.renderTargets[filter]) {
        this.copyToRenderTarget(filter);
      }
    });
  }

  private copyToRenderTarget(filter: THREE.TextureFilter) {
    if (!this.isAnnotation) return;

    const { renderer } = this.document;
    if (!renderer) return;

    this.textureAdapter.writeImage(
      this.internalTexture[THREE.NearestFilter],
      this.renderTargets[filter],
      renderer,
      MergeFunction.Replace,
    );

    this.textureAdapter.invalidateCache();

    this.hasCPUUpdates[filter] = false;
  }

  private onModificationsOnGPU() {
    if (!this.isAnnotation) return;
    this.isDataDirty = true;
    this.textureAdapter.invalidateCache();
  }

  private scheduleGPUPush() {
    if (!this.isAnnotation) return;

    this.getTextureData();
    this.internalTexture[THREE.NearestFilter].needsUpdate = true;
    this.hasCPUUpdates[THREE.NearestFilter] = true;
    this.hasCPUUpdates[THREE.LinearFilter] = true;
  }

  private pullDataFromGPU() {
    if (!this.document.renderer || !this.isAnnotation) return;

    if (this.hasWholeTextureChanged) {
      this.textureAdapter.readImage(
        this.document.renderer,
        this.getTexture(THREE.NearestFilter),
        this.textureData,
      );
      this.isDataDirty = true;
    } else {
      this.textureAdapter.readSlices(
        this.gpuUpdates,
        this.document.renderer,
        this.getTexture(THREE.NearestFilter),
        this.textureData,
      );
    }

    this.hasWholeTextureChanged = false;
    this.gpuUpdates = [];
  }

  /** Can override unsaved changes to the data that are only stored on the GPU. */
  public setData(data: TypedArray | Uint8Array | Float32Array) {
    super.setData(data);
    this.hasWholeTextureChanged = false;
    this.gpuUpdates = [];

    if (this.isAnnotation) {
      this.isTextureDataDirty = true;
      this.isDataDirty = false;
    }

    if (this.internalTexture) {
      this.scheduleGPUPush();
    }
  }

  public setTextureData(data: Uint8Array) {
    if (this.textureData === data || !this.isAnnotation) return;

    if (data.length !== this.textureData.length) {
      throw new Error("Provided data has the wrong length.");
    }

    this.textureData.set(data);
    this.hasWholeTextureChanged = false;
    this.gpuUpdates = [];
    this.isTextureDataDirty = false;
    this.isDataDirty = true;

    if (this.internalTexture) {
      this.scheduleGPUPush();
    }
  }

  public writeToTexture(
    texture: THREE.Texture,
    // eslint-disable-next-line default-param-last
    mergeFunction = MergeFunction.Replace,
    threshold?: number,
  ) {
    if (!this.document.renderer || !this.isAnnotation) return;

    this.textureAdapter.writeImage(
      texture,
      this.renderTargets[THREE.NearestFilter],
      this.document.renderer,
      mergeFunction,
      threshold,
    );
    this.textureAdapter.writeImage(
      texture,
      this.renderTargets[THREE.LinearFilter],
      this.document.renderer,
      mergeFunction,
      threshold,
    );

    this.hasWholeTextureChanged = true;
    this.onModificationsOnGPU();
  }

  public setSlice(
    viewType: ViewType,
    slice: number,
    sliceData?: Uint8Array | THREE.Texture,
    mergeFunction = MergeFunction.Replace,
  ) {
    if (this.document.renderer && this.isAnnotation) {
      this.textureAdapter.writeSlice(
        slice,
        viewType,
        sliceData,
        this.renderTargets[THREE.NearestFilter],
        this.document.renderer,
        mergeFunction,
      );
      this.textureAdapter.writeSlice(
        slice,
        viewType,
        sliceData,
        this.renderTargets[THREE.LinearFilter],
        this.document.renderer,
        mergeFunction,
      );

      this.gpuUpdates.push({ slice, viewType });
      this.onModificationsOnGPU();

      return;
    }

    if (sliceData === undefined || sliceData instanceof Uint8Array) {
      super.setSlice(viewType, slice, sliceData);
      this.isTextureDataDirty = true;
      this.scheduleGPUPush();
    }
  }

  public getSlice(viewType: ViewType, sliceNumber: number) {
    if (this.document.renderer && this.isAnnotation) {
      return this.textureAdapter.readSlice(
        sliceNumber,
        viewType,
        this.document.renderer,
        this.getTexture(THREE.NearestFilter),
      );
    }

    return super.getSlice(viewType, sliceNumber);
  }

  public readSliceToTarget(
    sliceNumber: number,
    viewType: ViewType,
    target: THREE.WebGLRenderTarget,
  ) {
    const { renderer } = this.document;
    if (!renderer) return;

    if (this.hasCPUUpdates[THREE.NearestFilter]) {
      this.copyToRenderTarget(THREE.NearestFilter);
    }

    this.textureAdapter.readSliceToTarget(
      sliceNumber,
      viewType,
      renderer,
      this.getTexture(THREE.NearestFilter),
      target,
    );
  }

  public getVoxelData(voxel: Voxel | Vector) {
    const index = this.getDataIndex(voxel);

    const textureData = this.getTextureData();
    const isIntArray = textureData.BYTES_PER_ELEMENT === 1;

    return new Vector(
      Array.from(textureData.slice(index, index + this.voxelComponents)),
      false,
    ).divideScalar(isIntArray ? 255 : 1);
  }

  public toJSON() {
    if (this.hasGPUUpdates) {
      this.pullDataFromGPU();
    }

    return super.toJSON();
  }
}
