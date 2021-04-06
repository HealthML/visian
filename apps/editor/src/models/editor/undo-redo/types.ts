export interface UndoRedoCommand {
  undo: () => boolean;
  redo: () => boolean;
}
