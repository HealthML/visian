import { RenderedImage, ToolRenderer } from "@visian/rendering";
import { IDocument, IImageLayer, ITool } from "@visian/ui-shared";

import { SelfDeactivatingTool } from "./self-deactivating-tool";
import { ImageCommand } from "../history";

export class ClearImageTool<
  N extends "clear-image",
> extends SelfDeactivatingTool<N> {
  public readonly excludeFromSnapshotTracking = ["toolRenderer", "document"];

  constructor(document: IDocument, protected toolRenderer: ToolRenderer) {
    super(
      {
        name: "clear-image" as N,
        icon: "clearScan",
        labelTx: "clear-image",
        supportedViewModes: ["2D", "3D"],
        supportedLayerKinds: ["image"],
        supportAnnotationsOnly: true,
        activationKeys: "ctrl+del,ctrl+backspace",
      },
      document,
    );
  }

  public activate(previousTool?: ITool<N>) {
    const imageLayer = this.document.activeLayer;
    if (!imageLayer || imageLayer.kind !== "image") return;
    const image = (imageLayer as IImageLayer).image as RenderedImage;

    const oldData = new Uint8Array(image.getTextureData());

    const emptyData = new Uint8Array(oldData.length);
    image.setTextureData(emptyData);
    this.document.sliceRenderer?.lazyRender();
    this.document.volumeRenderer?.lazyRender(true);

    this.document.history.addCommand(
      new ImageCommand(
        {
          layerId: imageLayer.id,
          oldData,
          newData: emptyData,
        },
        this.document,
      ),
    );

    (imageLayer as IImageLayer).clearSliceMarkers();

    super.activate(previousTool);
  }
}
