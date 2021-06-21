import { ToolRenderer } from "@visian/rendering";
import { IDocument, IImageLayer, ITool } from "@visian/ui-shared";
import { SliceCommand } from "../history";
import { SelfDeactivatingTool } from "./self-deactivating-tool";

export class ClearSliceTool<
  N extends "clear-slice"
> extends SelfDeactivatingTool<N> {
  constructor(document: IDocument, protected toolRenderer: ToolRenderer) {
    super(
      {
        name: "clear-slice" as N,
        icon: "trash",
        labelTx: "clear-slice",
        supportedViewModes: ["2D"],
        supportedLayerKinds: ["image"],
      },
      document,
    );
  }

  public activate(previousTool?: ITool<N>) {
    const imageLayer = this.document.activeLayer;
    if (!imageLayer || imageLayer.kind !== "image") return;

    const { image } = imageLayer as IImageLayer;
    const viewType = this.document.viewport2D.mainViewType;
    const slice = this.document.viewport2D.getSelectedSlice();

    const oldSliceData = image.getSlice(viewType, slice);
    image.setSlice(viewType, slice);
    this.document.sliceRenderer?.lazyRender();
    this.document.volumeRenderer?.lazyRender(true);

    this.document.history.addCommand(
      new SliceCommand(
        {
          layerId: imageLayer.id,
          slice,
          viewType,
          oldSliceData,
        },
        this.document,
      ),
    );

    (imageLayer as IImageLayer).clearSliceMarkers(viewType, slice);

    super.activate(previousTool);
  }
}
