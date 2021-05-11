import { getOrthogonalAxis, getPlaneAxes, IDisposer } from "@visian/utils";
import { reaction } from "mobx";
import * as THREE from "three";

import { Editor } from "../../../models";
import { Circle } from "../types";
import { Circles } from "./circles";

export class CircleRenderer {
  private circlesToRender: Circle[] = [];

  private circles: Circles;
  private renderTargets: THREE.WebGLRenderTarget[] = [];

  private disposers: IDisposer[] = [];

  constructor(private editor: Editor) {
    this.circles = new Circles(editor);

    this.disposers.push(
      reaction(
        () => ({
          mainViewType: editor.viewSettings.mainViewType,
          selectedSlice: editor.viewSettings.selectedVoxel.getFromView(
            editor.viewSettings.mainViewType,
          ),
          annotation: editor.annotation,
        }),
        (params) => {
          this.resizeRenderTargets();
          this.readCurrentSlice(params);
        },
        { fireImmediately: true },
      ),
      reaction(
        () => editor.renderers,
        (renderers) => {
          if (renderers) {
            this.renderTargets = renderers.map(
              () => new THREE.WebGLRenderTarget(1, 1),
            );
            this.resizeRenderTargets();
            this.readCurrentSlice();
          } else {
            this.renderTargets = [];
          }
        },
        { fireImmediately: true },
      ),
    );
  }

  public dispose() {
    this.circles.dispose();
    this.disposers.forEach((disposer) => disposer());
  }

  public readCurrentSlice = (
    { mainViewType, selectedSlice, annotation } = {
      mainViewType: this.editor.viewSettings.mainViewType,
      selectedSlice: this.editor.viewSettings.selectedVoxel.getFromView(
        this.editor.viewSettings.mainViewType,
      ),
      annotation: this.editor.annotation,
    },
  ) => {
    if (!annotation) return;

    this.renderTargets.forEach((renderTarget, index) => {
      annotation.readSliceToTarget(
        selectedSlice,
        mainViewType,
        index,
        renderTarget,
      );
    });
  };

  public render() {
    if (!this.circlesToRender.length) return;

    const { renderers, annotation } = this.editor;
    if (!renderers || !annotation) return;

    this.circles.setFromCircleCenters(this.circlesToRender);
    this.circlesToRender = [];

    renderers.forEach((renderer, index) => {
      renderer.setRenderTarget(this.renderTargets[index]);
      renderer.autoClear = false;

      renderer.render(this.circles, this.circles.camera);

      renderer.autoClear = true;
      renderer.setRenderTarget(null);
    });

    const viewType = this.editor.viewSettings.mainViewType;
    const orthogonalAxis = getOrthogonalAxis(viewType);
    annotation.setSlice(
      viewType,
      this.editor.viewSettings.selectedVoxel[orthogonalAxis],
      this.textures,
    );
  }

  public renderCircles(...circles: Circle[]) {
    this.circlesToRender.push(...circles);
  }

  private get textures() {
    return this.renderTargets.map((renderTarget) => renderTarget.texture);
  }

  private resizeRenderTargets = () => {
    const { annotation } = this.editor;
    const voxelCount = annotation?.voxelCount;
    if (!voxelCount) return;

    const [widthAxis, heightAxis] = getPlaneAxes(
      this.editor.viewSettings.mainViewType,
    );

    const width = voxelCount[widthAxis];
    const height = voxelCount[heightAxis];

    this.renderTargets.forEach((renderTarget) => {
      renderTarget.setSize(width, height);
    });
  };
}
