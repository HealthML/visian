import { RenderedImage, ToolRenderer } from "@visian/rendering";
import { IDocument, IImageLayer, ITool } from "@visian/ui-shared";
import { ImageCommand } from "../history";
import { SelfDeactivatingTool } from "./self-deactivating-tool";

export class ClearImageTool<
  N extends "clear-image"
> extends SelfDeactivatingTool<N> {
  constructor(document: IDocument, protected toolRenderer: ToolRenderer) {
    super(
      {
        name: "clear-image" as N,
        icon: "trash",
        labelTx: "clear-image",
        supportedViewModes: ["2D", "3D"],
        supportedLayerKinds: ["image"],
        supportAnnotationsOnly: true,
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
