import { IDocument, IImageLayer } from "@visian/ui-shared";
import { RenderedImage, ToolRenderer } from "../../../rendering";
import { SliceCommand } from "../history";
import { Tool, ToolConfig } from "./tool";

export class UndoableTool extends Tool {
  private oldSliceData?: Uint8Array;
  private sliceNumber?: number;

  constructor(
    config: ToolConfig,
    document: IDocument,
    protected toolRenderer: ToolRenderer,
  ) {
    super(config, document);
  }

  protected startStroke(
    image = (this.document.layers[0] as IImageLayer).image,
    viewType = this.document.viewport2D.mainViewType,
    sliceNumber = this.document.viewSettings.selectedVoxel.getFromView(
      viewType,
    ),
  ) {
    this.sliceNumber = sliceNumber;
    this.oldSliceData = image?.getSlice(sliceNumber, viewType);
  }

  protected endStroke(
    isDeleteOperation: boolean | undefined,
    imageLayer = this.document.layers[0] as IImageLayer,
    viewType = this.document.viewport2D.mainViewType,
  ) {
    const image = imageLayer.image as RenderedImage;

    this.toolRenderer.waitForRender().then(() => {
      const slice = this.sliceNumber;
      if (image && slice !== undefined && this.oldSliceData) {
        this.document.history.addCommand(
          new SliceCommand(
            {
              layerId: imageLayer.id,
              viewType,
              slice,
              oldSliceData: this.oldSliceData,
              newSliceData: image.getSlice(slice, viewType),
            },
            this.document,
          ),
        );
      }

      this.sliceNumber = undefined;
      this.oldSliceData = undefined;

      // TODO: inferAnnotatedSlice and persist
      // this.document.tools.finishStroke(
      //   image,
      //   slice,
      //   viewType,
      //   isDeleteOperation,
      // );
    });
  }
}
