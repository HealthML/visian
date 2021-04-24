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
    image = this.editor.annotation,
    viewType = this.editor.viewSettings.mainViewType,
  ) {
    if (image) {
      image.finishStroke();

      if (this.undoable && this.sliceNumber !== undefined) {
        this.editor.undoRedo.addCommand(
          new SliceUndoRedoCommand(
            image,
            viewType,
            this.sliceNumber,
            this.oldSliceData,
            image.getSlice(this.sliceNumber, viewType),
          ),
        );
      }
    }

    if (this.undoable) {
      this.strokeActive = false;
      this.oldSliceData = undefined;
      this.sliceNumber = undefined;
    }

    this.editor.tools.finishStroke();
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
