import type { ISerializable } from "@visian/utils";

export interface IUndoRedoCommandSnapshot {
  kind: string;
}

export interface IUndoRedoCommand
  extends ISerializable<IUndoRedoCommandSnapshot> {
  kind: string;

  layerId: string;

  /** Rolls back to the state before the command. */
  undo(): void;
  /** Produces the state after the command. */
  redo(): void;
}

export interface IHistory {
  /** Indicates if undo steps are available. */
  canUndo(layerId: string): boolean;
  /** Indicates if redo steps are available. */
  canRedo(layerId: string): boolean;

  /** Travels back one command in the document's history. */
  undo(layerId: string): void;
  /** Travels forward one command in the document's history. */
  redo(layerId: string): void;

  /** Pushes an undo/redo command onto the history. */
  addCommand(command: IUndoRedoCommand): void;

  /** Removes all commands from the history. */
  clear(layerId?: string): void;

  /** checks if a layer has changed */
  hasChanges(layerId: string): boolean;
}
