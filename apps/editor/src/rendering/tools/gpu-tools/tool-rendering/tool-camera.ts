import { getPlaneAxes, IDisposable, IDisposer } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";
import { Editor } from "../../../../models";

export class ToolCamera
  extends THREE.OrthographicCamera
  implements IDisposable {
  private disposers: IDisposer[] = [];

  constructor(editor: Editor) {
    super(-0.5, 0, 0, -0.5, 0);

    this.disposers.push(
      autorun(() => {
        const image = editor.annotation;
        if (!image) return;

        const [xAxis, yAxis] = getPlaneAxes(editor.viewSettings.mainViewType);
        const x = image.voxelCount[xAxis];
        const y = image.voxelCount[yAxis];

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
