import { ThresholdAnnotationRenderer3D } from "@visian/rendering";
import {
  IDocument,
  IImageLayer,
  IPreviewedTool,
  ISelfDeactivatingTool,
  ITool,
} from "@visian/ui-shared";

import { Tool } from "./tool";
import { mutateAtlas } from "./utils";

export class ThresholdAnnotationTool<
    N extends "threshold-annotation" = "threshold-annotation"
  >
  extends Tool<N>
  implements IPreviewedTool<N>, ISelfDeactivatingTool<N> {
  public readonly excludeFromSnapshotTracking = ["document", "renderer"];
  public readonly isSelfDeactivating = true;

  protected previousTool?: N;

  constructor(
    document: IDocument,
    protected renderer: ThresholdAnnotationRenderer3D,
  ) {
    super(
      {
        name: "threshold-annotation" as N,
        icon: "settings",
        labelTx: "threshold-annotation",
        supportedViewModes: ["2D", "3D"],
        supportedLayerKinds: ["image"],
      },
      document,
    );
  }

  public activate(previousTool?: ITool<N>) {
    this.previousTool = previousTool?.name;
    this.renderer.setPreviewColor(this.document.getAnnotationPreviewColor());
    this.renderer.render();
  }

  public submit = () => {
    const targetLayer = this.document.activeLayer;
    mutateAtlas(
      targetLayer as IImageLayer,
      () => this.renderer.flushToAnnotation(targetLayer as IImageLayer),
      this.document,
    );

    this.document.tools.setActiveTool(this.previousTool);
  };

  public discard = () => {
    this.renderer.discard();
    this.document.tools.setActiveTool(this.previousTool);
  };

  public deactivate() {
    this.renderer.discard();
  }
}
