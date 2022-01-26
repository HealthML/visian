import { ImageRenderTarget, Texture3DRenderer } from "@visian/rendering";
import { IEditor } from "@visian/ui-shared";
import { IDisposable, Vector, ViewType } from "@visian/utils";
import { autorun, IReactionDisposer } from "mobx";
import * as THREE from "three";
import { Texture3DCopyMaterial } from "../../../texture-3d-renderer/texture-3d-copy-material";

import { SharedUniforms } from "../shared-uniforms";
import { getTotalLAODirections } from "./lao-directions";
import { LAOMaterial } from "./lao-material";

export class LAOComputer implements IDisposable {
  private _isDirty = true;

  private _isFinalLAOFlushed = false;
  private isFirstFrameStarted = false;

  private target: THREE.WebGLRenderTarget;
  private intermediateTarget: THREE.WebGLRenderTarget;

  private laoMaterial: LAOMaterial;
  private copyMaterial: Texture3DCopyMaterial;

  private startSlice = 0;
  private sliceCount = 0;

  private renderer: THREE.WebGLRenderer;

  private texture3DRenderer = new Texture3DRenderer();

  private reactionDisposers: IReactionDisposer[] = [];

  // For some reason Chrome has trouble with rendering the LAO and copying it to the output target in the same step.
  // Thus we seperate the LAO computation and copying steps. This variable tracks the current step.
  private isCopying = false;

  constructor(
    private editor: IEditor,
    sharedUniforms: SharedUniforms,
    firstDerivativeTexture: THREE.Texture,
    // secondDerivativeTexture: THREE.Texture,
    private flush: () => void,
  ) {
    this.renderer = editor.renderer;

    const imageProperties = {
      voxelCount: new Vector([1, 1, 1]),
      is3D: true,
      defaultViewType: ViewType.Transverse,
    };
    this.target = new ImageRenderTarget(imageProperties, THREE.LinearFilter);
    this.intermediateTarget = new ImageRenderTarget(
      imageProperties,
      THREE.LinearFilter,
    );

    this.laoMaterial = new LAOMaterial(
      editor,
      firstDerivativeTexture,
      // secondDerivativeTexture,
      this.target.texture,
      sharedUniforms,
    );

    this.copyMaterial = new Texture3DCopyMaterial(
      this.intermediateTarget.texture,
    );

    this.reactionDisposers.push(
      autorun(() => {
        const baseImageLayer = this.editor.activeDocument?.baseImageLayer;
        if (!baseImageLayer?.is3DLayer) return;

        const { voxelCount } = baseImageLayer.image;

        [this.target, this.intermediateTarget].forEach((renderTarget) => {
          renderTarget.setSize(voxelCount.x, voxelCount.y, voxelCount.z);
        });

        this.sliceCount = voxelCount.z;

        this.setDirty();
      }),
    );
  }

  public dispose() {
    this.reactionDisposers.forEach((disposer) => disposer());
    this.laoMaterial.dispose();
    this.texture3DRenderer.dispose();
  }

  public get isDirty() {
    return this._isDirty;
  }

  public get output() {
    return this.target.texture;
  }

  /** Whether or not the final progressive LAO frame has been flushed. */
  public get isFinalLAOFlushed() {
    return this._isFinalLAOFlushed;
  }

  public get isFrameFinished() {
    return this.startSlice >= this.sliceCount;
  }

  public tick() {
    if (this._isDirty && !this.isFirstFrameStarted) {
      this.laoMaterial.setPreviousDirections(0);
      this.startSlice = 0;
      this.isFirstFrameStarted = true;
    }

    if (!this.isFrameFinished) {
      this.render();
    }
  }

  private render() {
    const slicesToRender =
      (this.editor.performanceMode === "high" ? 16 : 1) *
      (this.isCopying ? 16 : 1); // Copying is much faster than computing LAO.

    const isXrEnabled = this.renderer.xr.enabled;
    this.renderer.xr.enabled = false;

    if (this.isCopying) {
      this.texture3DRenderer.setMaterial(this.copyMaterial);
      this.texture3DRenderer.setTarget(this.target);

      this.texture3DRenderer.render(this.renderer, [
        this.startSlice,
        this.startSlice + slicesToRender,
      ]);
    } else {
      this.texture3DRenderer.setMaterial(this.laoMaterial);
      this.texture3DRenderer.setTarget(this.intermediateTarget);

      this.texture3DRenderer.render(this.renderer, [
        this.startSlice,
        this.startSlice + slicesToRender,
      ]);
    }

    this.renderer.xr.enabled = isXrEnabled;

    this.startSlice += slicesToRender;
    if (this.isFrameFinished) {
      if (this.isCopying) {
        this.onFrameFinished();
        this.isCopying = false;
      } else {
        this.startSlice = 0;
        this.isCopying = true;
      }
    }
  }

  protected onFrameFinished() {
    this._isDirty = false;

    this.flush();
    if (this.editor.activeDocument?.viewport3D.requestedShadingMode === "lao") {
      this.editor.activeDocument?.viewport3D.confirmRequestedShadingMode();
    }

    this.laoMaterial.setPreviousDirections(
      this.laoMaterial.previousDirections + 8,
    );

    const totalLAORays = getTotalLAODirections(this.editor.performanceMode);

    if (this.laoMaterial.previousDirections < totalLAORays) {
      this.startSlice = 0;
    } else {
      this._isFinalLAOFlushed = true;
    }
  }

  public setDirty = () => {
    this._isDirty = true;
    this.isFirstFrameStarted = false;
    this._isFinalLAOFlushed = false;
    this.isCopying = false;
  };
}
