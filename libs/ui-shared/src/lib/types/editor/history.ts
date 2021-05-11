export interface IUndoRedoCommand {
  /** Rolls back to the state before the command. */
  undo(): void;
  /** Produces the state after the command. */
  redo(): void;
}

export interface IHistory {
  /** Indicates if undo steps are available. */
  canUndo: boolean;
  /** Indicates if redo steps are available. */
  canRedo: boolean;

  /** Travels back one command in the document's history. */
  undo(): void;
  /** Travels forward one command in the document's history. */
  redo(): void;

  /** Pushes an undo/redo command onto the history. */
  addCommand: (command: IUndoRedoCommand) => void;

  /** Removes all commands from the history. */
  clear(): void;
}
