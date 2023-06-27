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
  undoRedoStacks: {
    layerId: string;
    undoRedoStack: LimitedStackSnapshot<IUndoRedoCommandSnapshot>;
  }[];
}

export class History
  implements Partial<IHistory>, ISerializable<HistorySnapshot>
{
  public readonly excludeFromSnapshotTracking = ["document"];

  protected undoRedoStacks = new Map<string, LimitedStack<IUndoRedoCommand>>();

  constructor(
    snapshot: Partial<HistorySnapshot> | undefined,
    protected document: IDocument,
  ) {
    if (snapshot) this.applySnapshot(snapshot);

    makeObservable<this, "undoRedoStacks">(this, {
      undoRedoStacks: observable,

      undo: action,
      redo: action,
      addCommand: action,
      clear: action,
      applySnapshot: action,
    });
  }

  public canUndo(layerId: string) {
    return this.undoRedoStacks.get(layerId)?.canNavigateBackward() ?? false;
  }

  public canRedo(layerId: string) {
    return this.undoRedoStacks.get(layerId)?.canNavigateForward() ?? false;
  }

  public undo = (layerId: string) => {
    if (!this.canUndo(layerId)) return;

    // As we can undo, we can be sure that there is at least the current item
    // in the stack.
    this.undoRedoStacks.get(layerId)?.getCurrent()?.undo();
    this.undoRedoStacks.get(layerId)?.navigateBackward();
  };

  public redo = (layerId: string) => {
    if (!this.canRedo(layerId)) return;

    // As we can redo, we can be sure that we can navigate forward
    // in the stack.
    this.undoRedoStacks.get(layerId)?.navigateForward()?.redo();
  };

  public addCommand(command: IUndoRedoCommand) {
    const { layerId } = command;
    if (!this.undoRedoStacks.has(layerId)) {
      this.undoRedoStacks.set(
        layerId,
        new LimitedStack<IUndoRedoCommand>(maxUndoRedoSteps),
      );
    }
    this.undoRedoStacks.get(layerId)?.push(command);
  }

  public clear = (layerId?: string) => {
    if (layerId) {
      this.undoRedoStacks.delete(layerId);
    } else {
      this.undoRedoStacks = new Map<string, LimitedStack<IUndoRedoCommand>>();
    }
  };

  // Serialization
  public toJSON(): HistorySnapshot {
    const stackSnapshot = [...this.undoRedoStacks.entries()].map(
      ([layerId, stack]) => {
        const jsonStack = stack.toJSON();
        return {
          layerId,
          undoRedoStack: {
            ...jsonStack,
            buffer: jsonStack.buffer.map((command) => command.toJSON()),
          },
        };
      },
    );

    return {
      undoRedoStacks: stackSnapshot,
    };
  }

  public async applySnapshot(
    snapshot: Partial<HistorySnapshot>,
  ): Promise<void> {
    if (!snapshot.undoRedoStacks) {
      this.clear();
      return;
    }
    await Promise.all(
      snapshot.undoRedoStacks.map(async (stackSnapshot) => {
        if (!this.undoRedoStacks.has(stackSnapshot.layerId)) {
          this.undoRedoStacks.set(
            stackSnapshot.layerId,
            new LimitedStack<IUndoRedoCommand>(maxUndoRedoSteps),
          );
        }
        await this.undoRedoStacks.get(stackSnapshot.layerId)?.applySnapshot({
          ...stackSnapshot.undoRedoStack,
          buffer: stackSnapshot.undoRedoStack.buffer
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
      }),
    );
  }

  public hasChanges(layerId?: string): boolean {
    if (!layerId) {
      return [...this.undoRedoStacks.values()].some((stack) =>
        stack.canNavigateBackward(),
      );
    }
    return this.undoRedoStacks.get(layerId)?.canNavigateBackward() ?? false;
  }
}
