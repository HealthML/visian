import { Editor, SliceUndoRedoCommand } from "../../../models";
import { ToolRenderer } from "./tool-rendering";

export class UndoableTool {
  private oldSliceData?: Uint8Array;
  private sliceNumber?: number;

  constructor(
    protected editor: Editor,
    protected circleRenderer: ToolRenderer,
  ) {}

  protected startStroke(
    image = this.editor.annotation,
    viewType = this.editor.viewSettings.mainViewType,
    sliceNumber = this.editor.viewSettings.selectedVoxel.getFromView(viewType),
  ) {
    this.sliceNumber = sliceNumber;
    this.oldSliceData = image?.getSlice(sliceNumber, viewType);
  }

  protected endStroke(
    isDeleteOperation: boolean | undefined,
    image = this.editor.annotation,
    viewType = this.editor.viewSettings.mainViewType,
  ) {
    const slice = this.sliceNumber;
    if (image && slice !== undefined) {
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

    this.sliceNumber = undefined;
    this.oldSliceData = undefined;

    this.editor.tools.finishStroke(image, slice, viewType, isDeleteOperation);
  }
}
