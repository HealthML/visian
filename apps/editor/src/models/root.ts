import { IStorageBackend } from "@visian/ui-shared";
import { action, makeObservable, observable } from "mobx";
import { deepObserve } from "mobx-utils/lib/deepObserve";

import { Editor, EditorSnapshot } from "./editor";
import { ISerializable, Snapshot } from "./types";

export interface RootSnapshot {
  editor: EditorSnapshot;
}

export interface RootStoreConfig {
  previousSnapshot?: RootSnapshot;
  storageBackend?: IStorageBackend<Snapshot>;
}

export class RootStore implements ISerializable<RootSnapshot> {
  /**
   * Indicates if there are changes that have not yet been written by the
   * given storage backend.
   */
  public isDirty = false;

  public editor: Editor;

  constructor(protected config: RootStoreConfig = {}) {
    this.editor = new Editor({
      persistImmediately: this.persistImmediately,
    });

    makeObservable(this, {
      isDirty: observable,
      editor: observable,
      applySnapshot: action,
      rehydrate: action,
      setIsDirty: action,
    });
    deepObserve(this.editor, () => {
      this.setIsDirty(true);
      this.config.storageBackend
        ?.persist("/editor", this.editor.toJSON())
        .then(() => {
          this.setIsDirty(false);
        });
    });
  }

  public setIsDirty(isDirty = true) {
    this.isDirty = isDirty;
  }

  public persistImmediately = async () => {
    await this.config.storageBackend?.persistImmediately(
      "/editor",
      this.editor.toJSON(),
    );
    this.setIsDirty(false);
  };

  public toJSON() {
    return { editor: this.editor.toJSON() };
  }

  public async applySnapshot(snapshot: RootSnapshot) {
    await this.editor.applySnapshot(snapshot.editor);
  }

  public async rehydrate() {
    const editorSnapshot = await this.config.storageBackend?.retrieve(
      "/editor",
    );
    if (editorSnapshot) {
      await this.editor.applySnapshot(
        (editorSnapshot as unknown) as EditorSnapshot,
      );
    }
  }
}
