// DEPRECATED

import { RenderedImage } from "@visian/rendering";
import { IDocument, IImageLayer } from "@visian/ui-shared";
import { getOrthogonalAxis, VoxelWithValue } from "@visian/utils";
import { SliceCommand } from "../../history";
import { Tool, ToolConfig } from "../tool";

/**
 * The VoxelWriter handles editing an annotation (or image).
 *
 * If necessary it creates undo redo commands for the edits.
 */
export class VoxelWriter<N extends string> extends Tool<N> {
  private strokeActive = false;

  private sliceNumber?: number;
  private oldSliceData?: Uint8Array;

  constructor(
    config: ToolConfig<N>,
    document: IDocument,
    private undoable: boolean,
  ) {
    super(config, document);
  }

  protected finishStroke(
    isDeleteOperation: boolean | undefined,
    layer = this.document.activeLayer,
    viewType = this.document.viewport2D.mainViewType,
  ) {
    if (!layer) return;
    const imageLayer = layer as IImageLayer;
    const image = imageLayer.image as RenderedImage;

    // The RenderedImage needs to receive one more update before the modified
    // slice can be read with all updates.
    (imageLayer.image as RenderedImage).waitForRender().then(() => {
      const slice = this.sliceNumber;

      if (this.undoable && slice !== undefined && this.oldSliceData) {
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

      if (this.undoable) {
        this.strokeActive = false;
        this.oldSliceData = undefined;
        this.sliceNumber = undefined;
      }

      this.document.tools.handleCurrentSliceChanged();
      imageLayer.recomputeSliceMarkers(viewType, slice, isDeleteOperation);
      this.document.requestSave();
    });
  }

  protected writeVoxels(
    voxels: VoxelWithValue[],
    viewType = this.document.viewport2D.mainViewType,
    layer = this.document.activeLayer,
  ) {
    if (!layer || !voxels.length) return;
    const image = (layer as IImageLayer).image as RenderedImage;

    if (this.undoable && !this.strokeActive) {
      this.strokeActive = true;
      this.sliceNumber = voxels[0][getOrthogonalAxis(viewType)];
      this.oldSliceData = image.getSlice(viewType, this.sliceNumber);
    }

    image.setAtlasVoxels(voxels);

    this.document.sliceRenderer?.lazyRender();
    this.document.volumeRenderer?.lazyRender(true);
  }
}

export default VoxelWriter;
