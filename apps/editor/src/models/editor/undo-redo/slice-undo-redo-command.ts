// DEPRECATED

import { Image, ViewType } from "@visian/utils";

import { UndoRedoCommand } from "./types";

export class SliceUndoRedoCommand implements UndoRedoCommand {
  private done = true;

  constructor(
    public image: Image,
    public viewType: ViewType,
    public slice: number,
    private oldSliceData?: Uint8Array,
    private newSliceData?: Uint8Array,
  ) {}

  public undo() {
    if (!this.done) return false;

    this.image.setSlice(this.viewType, this.slice, this.oldSliceData);
    this.done = false;

    return true;
  }

  public redo() {
    if (this.done) return false;

    this.image.setSlice(this.viewType, this.slice, this.newSliceData);
    this.done = true;

    return true;
  }
}
