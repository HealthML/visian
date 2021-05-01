import { getOrthogonalAxis, VoxelWithValue } from "@visian/utils";

import { Editor } from "../editor";
import { SliceUndoRedoCommand } from "../undo-redo";

/**
 * The VoxelWriter handles editing an annotation (or image).
 *
 * If necessary it creates undo redo commands for the edits.
 */
export class VoxelWriter {
  private strokeActive = false;

  private sliceNumber?: number;
  private oldSliceData?: Uint8Array;

  constructor(protected editor: Editor, private undoable: boolean) {}

  protected finishStroke(
    isDeleteOperation: boolean | undefined,
    image = this.editor.annotation,
    viewType = this.editor.viewSettings.mainViewType,
  ) {
    // The RenderedImage needs to receive one more update before the modified
    // slice can be read with all updates. Thus, this is delayed a few ms.
    setTimeout(() => {
      const slice = this.sliceNumber;

      if (image) {
        if (this.undoable && slice !== undefined) {
          this.editor.undoRedo.addCommand(
            new SliceUndoRedoCommand(
              image,
              viewType,
              slice,
              this.oldSliceData,
              image.getSlice(slice, viewType),
            ),
          );
        }
      }

      if (this.undoable) {
        this.strokeActive = false;
        this.oldSliceData = undefined;
        this.sliceNumber = undefined;
      }

      this.editor.tools.finishStroke(image, slice, viewType, isDeleteOperation);
    }, 20);
  }

  protected writeVoxels(
    voxels: VoxelWithValue[],
    viewType = this.editor.viewSettings.mainViewType,
    image = this.editor.annotation,
  ) {
    if (!image || !voxels.length) return;

    if (this.undoable && !this.strokeActive) {
      this.strokeActive = true;
      this.sliceNumber = voxels[0][getOrthogonalAxis(viewType)];
      this.oldSliceData = image.getSlice(this.sliceNumber, viewType);
    }

    image.setAtlasVoxels(voxels);

    this.editor.sliceRenderer?.lazyRender();
  }
}

export default VoxelWriter;
