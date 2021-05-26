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
        labelTx: "clear-slice",
        supportedViewModes: ["2D"],
        supportedLayerKinds: ["image"],
      },
      document,
    );
  }

  public activate(previousTool?: ITool<N>) {
    const imageLayer = this.document.layers[0] as IImageLayer;
    const { image } = imageLayer;
    const viewType = this.document.viewport2D.mainViewType;
    const slice = this.document.viewport2D.getSelectedSlice();

    const oldSliceData = image.getSlice(slice, viewType);
    image.setSlice(viewType, slice);
    this.document.sliceRenderer?.lazyRender();

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

    this.toolRenderer.currentSliceChanged();

    imageLayer.clearSliceMarkers(viewType, slice);

    super.activate(previousTool);
  }
}
