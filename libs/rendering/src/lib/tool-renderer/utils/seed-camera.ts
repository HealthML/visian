import { IDocument, IImageLayer } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

export class SeedCamera
  extends THREE.OrthographicCamera
  implements IDisposable
{
  private disposers: IDisposer[] = [];

  constructor(document: IDocument) {
    super(-0.5, 0, 0, -0.5, 0, 10);

    this.disposers.push(
      autorun(() => {
        if (document.activeLayer?.kind !== "image") return;

        const [width, height] = (
          document.activeLayer as IImageLayer
        ).image.voxelCount.toArray();

        this.right = width - 0.5;
        this.top = height - 0.5;

        this.updateProjectionMatrix();
      }),
    );
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
  }
}
