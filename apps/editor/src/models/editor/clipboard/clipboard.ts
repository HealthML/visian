import { RenderedImage } from "@visian/rendering";
import {
  IClipboard,
  IDocument,
  IImageLayer,
  MergeFunction,
} from "@visian/ui-shared";
import { getPlaneAxes, IDisposable, Vector } from "@visian/utils";
import * as THREE from "three";

import { SliceCommand } from "../history";

export class Clipboard implements IClipboard, IDisposable {
  protected renderTarget: THREE.WebGLRenderTarget;
  protected size = new Vector([1, 1], false);
  protected hasCopiedSlice = false;

  constructor(protected document: IDocument) {
    this.renderTarget = new THREE.WebGLRenderTarget(1, 1, {
      magFilter: THREE.NearestFilter,
      minFilter: THREE.NearestFilter,
    });
  }

  public copy() {
    if (
      this.document.viewSettings.viewMode !== "2D" ||
      !this.document.activeLayer?.isAnnotation ||
      !this.document.activeLayer?.isVisible ||
      this.document.activeLayer.kind !== "image"
    ) {
      return;
    }

    this.ensureRenderTargetSize();

    const viewType = this.document.viewport2D.mainViewType;
    const sliceNumber = this.document.viewport2D.getSelectedSlice();

    (
      (this.document.activeLayer as IImageLayer).image as RenderedImage
    ).readSliceToTarget(sliceNumber, viewType, this.renderTarget);

    this.hasCopiedSlice = true;
  }

  public paste(mergeFunction = MergeFunction.Replace) {
    if (
      !this.hasCopiedSlice ||
      this.document.viewSettings.viewMode !== "2D" ||
      !this.document.activeLayer?.isAnnotation ||
      !this.document.activeLayer?.isVisible ||
      this.document.activeLayer.kind !== "image" ||
      !this.size.equals(this.getCurrentSize())
    ) {
      return;
    }

    const viewType = this.document.viewport2D.mainViewType;
    const sliceNumber = this.document.viewport2D.getSelectedSlice();

    const imageLayer = this.document.activeLayer as IImageLayer;
    const image = imageLayer.image as RenderedImage;

    const oldSliceData = image.getSlice(viewType, sliceNumber);

    image.setSlice(
      viewType,
      sliceNumber,
      this.renderTarget.texture,
      mergeFunction,
    );
    this.document.sliceRenderer?.lazyRender();

    const newSliceData = image.getSlice(viewType, sliceNumber);

    this.document.history.addCommand(
      new SliceCommand(
        {
          layerId: imageLayer.id,
          viewType,
          slice: sliceNumber,
          oldSliceData,
          newSliceData,
        },
        this.document,
      ),
    );

    imageLayer.recomputeSliceMarkers(viewType, sliceNumber);
    this.document.requestSave();
  }

  public dispose() {
    this.renderTarget.dispose();
  }

  private getCurrentSize() {
    if (
      !this.document.activeLayer ||
      this.document.activeLayer.kind !== "image"
    ) {
      return new Vector([1, 1], false);
    }

    const { voxelCount } = (this.document.activeLayer as IImageLayer).image;
    const viewType = this.document.viewport2D.mainViewType;
    return new Vector(
      getPlaneAxes(viewType).map((axis) => voxelCount[axis]),
      false,
    );
  }

  private ensureRenderTargetSize() {
    if (
      !this.document.activeLayer?.isAnnotation ||
      !this.document.activeLayer?.isVisible ||
      this.document.activeLayer.kind !== "image"
    ) {
      return;
    }

    const size = this.getCurrentSize();

    if (this.size.equals(size)) return;

    this.renderTarget.setSize(size.x, size.y);
    this.hasCopiedSlice = false;

    this.size.copy(size);
  }
}
