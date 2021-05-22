import {
  IDocument,
  IHistory,
  IUndoRedoCommand,
  IUndoRedoCommandSnapshot,
  ValueType,
} from "@visian/ui-shared";
import {
  ISerializable,
  LimitedStack,
  LimitedStackSnapshot,
} from "@visian/utils";
import { action, makeObservable, observable } from "mobx";

import { maxUndoRedoSteps } from "../../../constants";
import * as commands from "./commands";

export const commandMap: {
  [kind: string]: ValueType<typeof commands>;
} = {};
Object.values(commands).forEach((command) => {
  commandMap[command.kind] = command;
});

export interface HistorySnapshot {
  undoRedoStack: LimitedStackSnapshot<IUndoRedoCommandSnapshot>;
}

export class History
  implements Partial<IHistory>, ISerializable<HistorySnapshot> {
  public static readonly excludeFromSnapshotTracking = ["/document"];

  protected undoRedoStack = new LimitedStack<IUndoRedoCommand>(
    maxUndoRedoSteps,
  );

  constructor(
    snapshot: Partial<HistorySnapshot> | undefined,
    protected document: IDocument,
  ) {
    if (snapshot) this.applySnapshot(snapshot);

    makeObservable<this, "undoRedoStack">(this, {
      undoRedoStack: observable,

      undo: action,
      redo: action,
      addCommand: action,
      clear: action,
      applySnapshot: action,
    });
  }

  public get canUndo(): boolean {
    return this.undoRedoStack.canNavigateBackward();
  }

  public get canRedo(): boolean {
    return this.undoRedoStack.canNavigateForward();
  }

  public undo = (): void => {
    if (!this.canUndo) return;

    // As we can undo, we can be sure that there is at least the current item
    // in the stack.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.undoRedoStack.getCurrent()!.undo();
    this.undoRedoStack.navigateBackward();
  };

  public redo = (): void => {
    if (!this.canRedo) return;

    // As we can redo, we can be sure that there is at least the current item
    // in the stack.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.undoRedoStack.getCurrent()!.redo();
    this.undoRedoStack.navigateForward();
  };

  public addCommand(command: IUndoRedoCommand): void {
    this.undoRedoStack.push(command);
  }

  public clear = (): void => {
    this.undoRedoStack.clear();
  };

  // Serialization
  public toJSON(): HistorySnapshot {
    const stackSnapshot = this.undoRedoStack.toJSON();

    return {
      undoRedoStack: {
        ...stackSnapshot,
        buffer: stackSnapshot.buffer.map((command) => command.toJSON()),
      },
    };
  }

  public applySnapshot(snapshot: Partial<HistorySnapshot>): Promise<void> {
    if (snapshot.undoRedoStack) {
      return this.undoRedoStack.applySnapshot({
        ...snapshot.undoRedoStack,
        buffer: snapshot.undoRedoStack.buffer
          .map((commandSnapshot) => {
            const Command = commandMap[commandSnapshot.kind];
            if (!Command) return;
            return new Command(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              commandSnapshot as any,
              this.document,
            );
          })
          .filter((command) => Boolean(command)) as IUndoRedoCommand[],
      });
    }

    this.clear();
    return Promise.resolve();
  }
}
