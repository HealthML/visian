import { IDocument, IImageLayer } from "@visian/ui-shared";
import { getPlaneAxes, IDisposable, IDisposer } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

export class ToolCamera
  extends THREE.OrthographicCamera
  implements IDisposable
{
  private disposers: IDisposer[] = [];

  constructor(document: IDocument) {
    super(-0.5, 0, 0, -0.5, 0);

    this.disposers.push(
      autorun(() => {
        if (document.activeLayer?.kind !== "image") return;

        const { voxelCount } = (document.activeLayer as IImageLayer).image;

        const [xAxis, yAxis] = getPlaneAxes(document.viewport2D.mainViewType);
        const x = voxelCount[xAxis];
        const y = voxelCount[yAxis];

        this.right = x - 0.5;
        this.top = y - 0.5;

        this.updateProjectionMatrix();
      }),
    );
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
  }
}
