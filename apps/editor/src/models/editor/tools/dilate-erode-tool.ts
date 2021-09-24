import { DilateErodeRenderer3D } from "@visian/rendering";
import {
  IDocument,
  IImageLayer,
  IPreviewedTool,
  ISelfDeactivatingTool,
  ITool,
} from "@visian/ui-shared";

import { Tool } from "./tool";
import { mutateAtlas } from "./utils";

export class DilateErodeTool<N extends "dilate-erode" = "dilate-erode">
  extends Tool<N>
  implements IPreviewedTool<N>, ISelfDeactivatingTool<N> {
  public readonly excludeFromSnapshotTracking = [
    "document",
    "dilateErodeRenderer",
  ];
  public readonly isSelfDeactivating = true;

  protected previousTool?: N;

  constructor(
    document: IDocument,
    protected dilateErodeRenderer: DilateErodeRenderer3D,
  ) {
    super(
      {
        name: "dilate-erode" as N,
        icon: "crosshair",
        labelTx: "dilate-erode",
        supportedViewModes: ["2D", "3D"],
        supportedLayerKinds: ["image"],
      },
      document,
    );
  }

  public activate(previousTool?: ITool<N>) {
    this.previousTool = previousTool?.name;

    const targetLayer = this.document.activeLayer;
    if (
      targetLayer &&
      this.document.activeLayer?.kind === "image" &&
      this.document.activeLayer.isAnnotation
    ) {
      this.dilateErodeRenderer.setTargetLayer(targetLayer as IImageLayer);
      this.dilateErodeRenderer.render();
    } else {
      this.document.tools.setActiveTool(previousTool);
    }
  }

  public submit = () => {
    const targetLayer = this.document.activeLayer;
    mutateAtlas(
      targetLayer as IImageLayer,
      () =>
        this.dilateErodeRenderer.flushToAnnotation(
          targetLayer as IImageLayer,
          true,
        ),
      this.document,
    );

    this.document.tools.setActiveTool(this.previousTool);
  };

  public discard = () => {
    this.document.tools.dilateErodeRenderer3D.discard();
    this.document.tools.setActiveTool(this.previousTool);
  };

  public deactivate() {
    this.document.tools.dilateErodeRenderer3D.discard();
  }
}
