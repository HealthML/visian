import {
  IDocument,
  IHistory,
  IUndoRedoCommand,
  IUndoRedoCommandSnapshot,
  ValueType,
} from "@visian/ui-shared";
import {
  CommandStack,
  CommandStackSnapshot,
  ISerializable,
} from "@visian/utils";
import { action, makeObservable, observable } from "mobx";

import * as commands from "./commands";
import { maxUndoRedoSteps } from "../../../constants";

export const commandMap: {
  [kind: string]: ValueType<typeof commands>;
} = {};
Object.values(commands).forEach((command) => {
  commandMap[command.kind] = command;
});

export interface HistorySnapshot {
  commandStacks: {
    layerId: string;
    commandStack: CommandStackSnapshot<IUndoRedoCommandSnapshot>;
  }[];
}

export class History
  implements Partial<IHistory>, ISerializable<HistorySnapshot>
{
  public readonly excludeFromSnapshotTracking = ["document"];

  protected commandStacks = new Map<string, CommandStack<IUndoRedoCommand>>();

  constructor(
    snapshot: Partial<HistorySnapshot> | undefined,
    protected document: IDocument,
  ) {
    if (snapshot) this.applySnapshot(snapshot);

    makeObservable<this, "commandStacks">(this, {
      commandStacks: observable,

      undo: action,
      redo: action,
      addCommand: action,
      clear: action,
      applySnapshot: action,
    });
  }

  public canUndo(layerId: string) {
    return this.commandStacks.get(layerId)?.canNavigateBackward() ?? false;
  }

  public canRedo(layerId: string) {
    return this.commandStacks.get(layerId)?.canNavigateForward() ?? false;
  }

  public undo = (layerId: string) => {
    if (!this.canUndo(layerId)) return;

    // As we can undo, we can be sure that there is at least the current item
    // in the stack.
    this.commandStacks.get(layerId)?.getCurrent()?.undo();
    this.commandStacks.get(layerId)?.navigateBackward();
  };

  public redo = (layerId: string) => {
    if (!this.canRedo(layerId)) return;

    // As we can redo, we can be sure that we can navigate forward
    // in the stack.
    this.commandStacks.get(layerId)?.navigateForward()?.redo();
  };

  public addCommand(command: IUndoRedoCommand) {
    const { layerId } = command;
    if (!this.commandStacks.has(layerId)) {
      this.commandStacks.set(
        layerId,
        new CommandStack<IUndoRedoCommand>(maxUndoRedoSteps),
      );
    }
    this.commandStacks.get(layerId)?.push(command);
  }

  public clear = (layerId?: string) => {
    if (layerId) {
      this.commandStacks.delete(layerId);
    } else {
      this.commandStacks = new Map<string, CommandStack<IUndoRedoCommand>>();
    }
  };

  // Serialization
  public toJSON(): HistorySnapshot {
    const stackSnapshot = [...this.commandStacks.entries()].map(
      ([layerId, stack]) => {
        const jsonStack = stack.toJSON();
        return {
          layerId,
          commandStack: {
            ...jsonStack,
            buffer: jsonStack.buffer.map((command) => command.toJSON()),
          },
        };
      },
    );

    return {
      commandStacks: stackSnapshot,
    };
  }

  public async applySnapshot(
    snapshot: Partial<HistorySnapshot>,
  ): Promise<void> {
    if (!snapshot.commandStacks) {
      this.clear();
      return;
    }
    await Promise.all(
      snapshot.commandStacks.map(async (stackSnapshot) => {
        if (!this.commandStacks.has(stackSnapshot.layerId)) {
          this.commandStacks.set(
            stackSnapshot.layerId,
            new CommandStack<IUndoRedoCommand>(maxUndoRedoSteps),
          );
        }
        await this.commandStacks.get(stackSnapshot.layerId)?.applySnapshot({
          ...stackSnapshot.commandStack,
          buffer: stackSnapshot.commandStack.buffer
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
      return [...this.commandStacks.values()].some((stack) => stack.isDirty());
    }
    return this.commandStacks.get(layerId)?.isDirty() ?? false;
  }

  public updateCheckpoint(layerId?: string) {
    if (!layerId) {
      [...this.commandStacks.values()].forEach((stack) => stack.save());
      return;
    }
    this.commandStacks.get(layerId)?.save();
  }
}
