import { ISerializable, LimitedStack } from "@visian/utils";
import { action, makeObservable, observable } from "mobx";

import { StoreContext } from "../../types";
import { Editor } from "../editor";
import { UndoRedoCommand } from "./types";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EditorUndoRedoSnapshot {}

export class EditorUndoRedo implements ISerializable<EditorUndoRedoSnapshot> {
  public static readonly excludeFromSnapshotTracking = ["/editor"];

  public isUndoAvailable = false;
  public isRedoAvailable = false;

  private undoRedoStack = new LimitedStack<UndoRedoCommand>(20);

  constructor(protected editor: Editor, protected context?: StoreContext) {
    makeObservable(this, {
      isUndoAvailable: observable,
      isRedoAvailable: observable,

      applySnapshot: action,
      undo: action,
      redo: action,
      addUndoCommand: action,
      clear: action,
    });
  }

  public undo() {
    if (!this.isUndoAvailable) return;

    const undoCommand = this.undoRedoStack.getCurrent();
    if (undoCommand?.undo()) {
      this.undoRedoStack.navigateBackward();
      this.isRedoAvailable = true;
      this.editor.sliceRenderer?.lazyRender();
    }

    this.isUndoAvailable = this.undoRedoStack.canNavigateBackward();
  }

  public redo() {
    if (!this.isRedoAvailable) return;

    const redoCommand = this.undoRedoStack.navigateForward();
    if (redoCommand?.redo()) {
      this.isUndoAvailable = true;
      this.editor.sliceRenderer?.lazyRender();
    }

    this.isRedoAvailable = this.undoRedoStack.canNavigateForward();
  }

  public addUndoCommand(undoCommand: UndoRedoCommand) {
    this.undoRedoStack.push(undoCommand);

    this.isUndoAvailable = true;
    this.isRedoAvailable = false;
  }

  public clear() {
    this.isRedoAvailable = false;
    this.isUndoAvailable = false;
    this.undoRedoStack.clear();
  }

  public toJSON() {
    return {};
  }

  public async applySnapshot(snapshot: EditorUndoRedoSnapshot) {
    // Intentionally left blank
  }
}
