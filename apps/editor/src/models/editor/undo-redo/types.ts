import { Image, ViewType } from "@visian/utils";

export interface UndoRedoCommand {
  undo: () => boolean;
  redo: () => boolean;

  image: Image;
  viewType?: ViewType;
  slice?: number;
}
