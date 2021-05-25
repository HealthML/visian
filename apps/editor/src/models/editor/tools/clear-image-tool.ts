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
        labelTx: "clear-image",
        supportedViewModes: ["2D", "3D"],
        supportedLayerKinds: ["image"],
      },
      document,
    );
  }

  public activate(previousTool?: ITool<N>) {
    const imageLayer = this.document.layers[0] as IImageLayer;
    const { image } = imageLayer;

    const oldAtlas = new Uint8Array(image.getAtlas());

    const emptyAtlas = new Uint8Array(oldAtlas.length);
    image.setAtlas(emptyAtlas);
    this.document.sliceRenderer?.lazyRender();

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

    this.toolRenderer.currentSliceChanged();

    // TODO: Clear markers

    super.activate(previousTool);
  }
}
