// DEPRECATED

import { Image } from "@visian/utils";

import { UndoRedoCommand } from "./types";

export class AtlasUndoRedoCommand implements UndoRedoCommand {
  private done = true;

  constructor(
    public image: Image,
    private oldAtlas: Uint8Array,
    private newAtlas: Uint8Array,
  ) {}

  public undo() {
    if (!this.done) return false;

    this.image.setAtlas(this.oldAtlas);
    this.done = false;

    return true;
  }

  public redo() {
    if (this.done) return false;

    this.image.setAtlas(this.newAtlas);
    this.done = true;

    return true;
  }
}
