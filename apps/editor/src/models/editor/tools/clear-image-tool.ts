import { ToolRenderer } from "@visian/rendering";
import { IDocument, IImageLayer, ITool } from "@visian/ui-shared";
import { AtlasCommand } from "../history";
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
    const { image } = imageLayer as IImageLayer;

    const oldAtlas = new Uint8Array(image.getAtlas());

    const emptyAtlas = new Uint8Array(oldAtlas.length);
    image.setAtlas(emptyAtlas);
    this.document.sliceRenderer?.lazyRender();
    this.document.volumeRenderer?.lazyRender(true);

    this.document.history.addCommand(
      new AtlasCommand(
        {
          layerId: imageLayer.id,
          oldAtlas,
          newAtlas: emptyAtlas,
        },
        this.document,
      ),
    );

    (imageLayer as IImageLayer).clearSliceMarkers();

    super.activate(previousTool);
  }
}
