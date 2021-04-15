import { ColorMode, IDispatch, IStorageBackend, Tab } from "@visian/ui-shared";
import { deepObserve, ISerializable } from "@visian/utils";
import { action, makeObservable, observable } from "mobx";

import { errorDisplayDuration } from "../constants";
import { Editor, EditorSnapshot } from "./editor";
import { ErrorNotification } from "./types";

export interface RootSnapshot {
  editor: EditorSnapshot;
}

export interface RootStoreConfig {
  previousSnapshot?: RootSnapshot;
  storageBackend?: IStorageBackend;
}

export class RootStore implements ISerializable<RootSnapshot> {
  public editor: Editor;

  /** The current theme. */
  public theme: ColorMode = "dark";

  protected errorTimeout?: NodeJS.Timer;
  public error?: ErrorNotification;

  /**
   * Indicates if there are changes that have not yet been written by the
   * given storage backend.
   */
  public isDirty = false;

  public shouldPersist = false;

  public refs: { [key: string]: React.RefObject<HTMLElement> } = {};
  public pointerDispatch?: IDispatch;

  constructor(protected config: RootStoreConfig = {}) {
    this.editor = new Editor({
      persist: this.persist,
      persistImmediately: this.persistImmediately,
      getTheme: () => this.theme,
    });

    makeObservable(this, {
      editor: observable,
      theme: observable,
      error: observable,
      isDirty: observable,
      refs: observable,

      setTheme: action,
      setError: action,
      applySnapshot: action,
      rehydrate: action,
      setIsDirty: action,
      setRef: action,
    });
    deepObserve(this.editor, this.persist, {
      exclude: Editor.excludeFromSnapshotTracking,
    });
  }

  public setTheme(theme: ColorMode, persist = true) {
    this.theme = theme;
    if (persist && this.shouldPersist) localStorage.setItem("theme", theme);
  }

  public setError(error?: ErrorNotification) {
    this.error = error;

    if (this.errorTimeout !== undefined) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = undefined;
    }
    if (error) {
      this.errorTimeout = (setTimeout(() => {
        this.setError();
      }, errorDisplayDuration) as unknown) as NodeJS.Timer;
    }
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

  public persist = async () => {
    if (!this.shouldPersist) return;
    this.setIsDirty(true);
    await this.config.storageBackend?.persist("/editor", () => {
      return this.editor.toJSON();
    });
    this.setIsDirty(false);
  };

  public persistImmediately = async () => {
    if (!this.shouldPersist) return;
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
    const tab = await new Tab().register();

    const theme = localStorage.getItem("theme");
    if (theme) this.setTheme(theme as ColorMode, false);

    if (!tab.isMainTab) return;
    const editorSnapshot = await this.config.storageBackend?.retrieve(
      "/editor",
    );
    if (editorSnapshot) {
      await this.editor.applySnapshot(editorSnapshot as EditorSnapshot);
    }

    this.shouldPersist = Boolean(tab.isMainTab);
  }

  public destroy = async () => {
    if (!this.shouldPersist) return;
    if (!window.confirm("Erase all application data?")) return;

    this.shouldPersist = false;
    localStorage.clear();
    await this.config.storageBackend?.clear();

    window.location.reload();
  };
}
