import { RenderedImage, ToolRenderer } from "@visian/rendering";
import { IDocument, IImageLayer } from "@visian/ui-shared";

import { SliceCommand } from "../history";
import { Tool, ToolConfig } from "./tool";

export class UndoableTool<N extends string> extends Tool<N> {
  public readonly excludeFromSnapshotTracking = ["toolRenderer", "document"];

  private oldSliceData?: Uint8Array;
  private sliceNumber?: number;

  constructor(
    config: ToolConfig<N>,
    document: IDocument,
    public toolRenderer: ToolRenderer,
  ) {
    super(config, document);
  }

  protected startStroke(
    image = (this.document.activeLayer as IImageLayer | undefined)?.image,
    viewType = this.document.viewport2D.mainViewType,
    sliceNumber = this.document.viewSettings.selectedVoxel.getFromView(
      viewType,
    ),
  ) {
    this.sliceNumber = sliceNumber;
    this.oldSliceData = image?.getSlice(viewType, sliceNumber);
  }

  protected endStroke(
    isDeleteOperation: boolean | undefined,
    imageLayer = this.document.activeLayer as IImageLayer | undefined,
    viewType = this.document.viewport2D.mainViewType,
  ) {
    this.toolRenderer.waitForRender().then(() => {
      this.toolRenderer.endStroke();

      if (!imageLayer) return;

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
                newSliceData: image.getSlice(viewType, slice),
              },
              this.document,
            ),
          );
        }

        this.sliceNumber = undefined;
        this.oldSliceData = undefined;

        imageLayer.recomputeSliceMarkers(viewType, slice, isDeleteOperation);
        this.document.requestSave();
      });
    });
  }
}
