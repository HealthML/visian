import { DilateErodeRenderer3D } from "@visian/rendering";
import {
  IDocument,
  IImageLayer,
  IPreviewedTool,
  ISelfDeactivatingTool,
  ITool,
} from "@visian/ui-shared";

import { Tool } from "./tool";
import { mutateTextureData } from "./utils";

export class DilateErodeTool<N extends "dilate-erode" = "dilate-erode">
  extends Tool<N>
  implements IPreviewedTool<N>, ISelfDeactivatingTool<N> {
  public readonly excludeFromSnapshotTracking = ["document", "renderer"];
  public readonly isSelfDeactivating = true;

  protected previousTool?: N;

  constructor(document: IDocument, protected renderer: DilateErodeRenderer3D) {
    super(
      {
        name: "dilate-erode" as N,
        icon: "plusMinus",
        labelTx: "dilate-erode",
        supportedViewModes: ["2D", "3D"],
        supportedLayerKinds: ["image"],
        supportAnnotationsOnly: true,
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
      this.document.activeLayer.isAnnotation &&
      this.document.activeLayer.isVisible
    ) {
      this.renderer.setTargetLayer(targetLayer as IImageLayer);
      this.renderer.render();
    } else {
      this.document.tools.setActiveTool(previousTool);
      this.document.setShowLayerMenu(true);
    }
  }

  public submit = () => {
    const targetLayer = this.document.activeLayer;
    mutateTextureData(
      targetLayer as IImageLayer,
      () => this.renderer.flushToAnnotation(targetLayer as IImageLayer, true),
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
