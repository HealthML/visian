import { RenderedImage } from "@visian/rendering";
import {
  IClipboard,
  IDocument,
  IImageLayer,
  MergeFunction,
} from "@visian/ui-shared";
import { getPlaneAxes, IDisposable, IDisposer, Vector } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

export class Clipboard implements IClipboard, IDisposable {
  protected renderTargets?: THREE.WebGLRenderTarget[];
  protected size = new Vector([1, 1], false);
  protected hasCopiedSlice = false;

  protected disposers: IDisposer[] = [];
  constructor(protected document: IDocument) {
    this.disposers.push(
      autorun(() => {
        const { renderers } = document;
        if (!renderers) return;
        this.renderTargets = renderers.map(
          () =>
            new THREE.WebGLRenderTarget(1, 1, {
              magFilter: THREE.NearestFilter,
              minFilter: THREE.NearestFilter,
            }),
        );
      }),
    );
  }

  public copy() {
    if (
      this.document.viewSettings.viewMode !== "2D" ||
      !this.renderTargets ||
      !this.document.activeLayer?.isAnnotation ||
      !this.document.activeLayer?.isVisible ||
      this.document.activeLayer.kind !== "image"
    ) {
      return;
    }

    this.ensureRenderTargetSize();

    const viewType = this.document.viewport2D.mainViewType;
    const sliceNumber = this.document.viewport2D.getSelectedSlice();

    this.renderTargets.forEach((target, index) => {
      ((this.document.activeLayer as IImageLayer)
        .image as RenderedImage).readSliceToTarget(
        sliceNumber,
        viewType,
        index,
        target,
      );
    });

    this.hasCopiedSlice = true;
  }

  public paste(mergeFunction = MergeFunction.Replace) {
    if (
      !this.hasCopiedSlice ||
      this.document.viewSettings.viewMode !== "2D" ||
      !this.renderTargets ||
      !this.document.activeLayer?.isAnnotation ||
      !this.document.activeLayer?.isVisible ||
      this.document.activeLayer.kind !== "image" ||
      !this.size.equals(this.getCurrentSize())
    ) {
      return;
    }

    const viewType = this.document.viewport2D.mainViewType;
    const sliceNumber = this.document.viewport2D.getSelectedSlice();

    ((this.document.activeLayer as IImageLayer)
      .image as RenderedImage).setSlice(
      viewType,
      sliceNumber,
      this.renderTargets.map((target) => target.texture),
      mergeFunction,
    );
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.renderTargets?.forEach((renderTarget) => renderTarget.dispose());
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
      !this.renderTargets ||
      !this.document.activeLayer?.isAnnotation ||
      !this.document.activeLayer?.isVisible ||
      this.document.activeLayer.kind !== "image"
    ) {
      return;
    }

    const size = this.getCurrentSize();

    if (this.size.equals(size)) return;

    this.renderTargets.forEach((renderTarget) =>
      renderTarget.setSize(size.x, size.y),
    );
    this.hasCopiedSlice = false;

    this.size.copy(size);
  }
}
