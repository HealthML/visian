import { ISerializable, LimitedStack } from "@visian/utils";
import { action, makeObservable, observable } from "mobx";

import { maxUndoRedoSteps } from "../../../constants";
import { StoreContext } from "../../types";
import { Editor } from "../editor";
import { UndoRedoCommand } from "./types";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EditorUndoRedoSnapshot {}

export class EditorUndoRedo implements ISerializable<EditorUndoRedoSnapshot> {
  public static readonly excludeFromSnapshotTracking = ["/editor"];

  private undoRedoStack = new LimitedStack<UndoRedoCommand>(maxUndoRedoSteps);

  constructor(protected editor: Editor, protected context?: StoreContext) {
    makeObservable<this, "undoRedoStack">(this, {
      undoRedoStack: observable,

      applySnapshot: action,
      undo: action,
      redo: action,
      addCommand: action,
      clear: action,
    });
  }

  public get isUndoAvailable() {
    return this.undoRedoStack.canNavigateBackward();
  }
  public get isRedoAvailable() {
    return this.undoRedoStack.canNavigateForward();
  }

  public undo = () => {
    if (!this.isUndoAvailable) return;

    const undoCommand = this.undoRedoStack.getCurrent();
    if (undoCommand?.undo()) {
      this.undoRedoStack.navigateBackward();
      this.editor.sliceRenderer?.lazyRender();
    }
  };

  public redo = () => {
    if (!this.isRedoAvailable) return;

    const redoCommand = this.undoRedoStack.navigateForward();
    if (redoCommand?.redo()) {
      this.editor.sliceRenderer?.lazyRender();
    }
  };

  public addCommand(undoCommand: UndoRedoCommand) {
    this.undoRedoStack.push(undoCommand);
  }

  public clear() {
    this.undoRedoStack.clear();
  }

  public toJSON() {
    return {};
  }

  public async applySnapshot(_snapshot: EditorUndoRedoSnapshot) {
    // Intentionally left blank
  }
}
