import { IDispatch, IStorageBackend } from "@visian/ui-shared";
import { deepObserve } from "@visian/util";
import { action, makeObservable, observable } from "mobx";

import { Editor, EditorSnapshot } from "./editor";
import { ISerializable } from "./types";

export interface RootSnapshot {
  editor: EditorSnapshot;
}

export interface RootStoreConfig {
  previousSnapshot?: RootSnapshot;
  storageBackend?: IStorageBackend;
}

export class RootStore implements ISerializable<RootSnapshot> {
  public editor: Editor;

  /**
   * Indicates if there are changes that have not yet been written by the
   * given storage backend.
   */
  public isDirty = false;

  public refs: { [key: string]: React.RefObject<HTMLElement> } = {};
  public pointerDispatch?: IDispatch;

  constructor(protected config: RootStoreConfig = {}) {
    this.editor = new Editor({
      persistImmediately: this.persistImmediately,
    });

    makeObservable(this, {
      editor: observable,
      isDirty: observable,
      refs: observable,
      applySnapshot: action,
      rehydrate: action,
      setIsDirty: action,
      setRef: action,
    });
    deepObserve(
      this.editor,
      () => {
        this.setIsDirty(true);
        this.config.storageBackend
          ?.persist("/editor", () => this.editor.toJSON())
          .then(() => {
            this.setIsDirty(false);
          });
      },
      { exclude: Editor.excludeFromSnapshotTracking },
    );
  }

  public setIsDirty(isDirty = true) {
    this.isDirty = isDirty;
  }

  public setRef<T extends HTMLElement>(key: string, ref?: React.RefObject<T>) {
    if (ref) {
      this.refs[key] = ref;
    } else {
      delete this.refs[key];
    }
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
      await this.editor.applySnapshot(editorSnapshot as EditorSnapshot);
    }
  }
}
