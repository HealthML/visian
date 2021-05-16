import {
  ColorMode,
  getTheme,
  IDispatch,
  IStorageBackend,
  Tab,
} from "@visian/ui-shared";
import { deepObserve, ISerializable } from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";

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
  public colorMode: ColorMode = "dark";

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
      setDirty: action(this.setIsDirty),
      getTheme: () => this.theme,
      getRefs: () => this.refs,
    });

    makeObservable(this, {
      editor: observable,
      colorMode: observable,
      error: observable,
      isDirty: observable,
      refs: observable,

      theme: computed,

      setColorMode: action,
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

  public setColorMode(theme: ColorMode, persist = true) {
    this.colorMode = theme;
    if (persist && this.shouldPersist) localStorage.setItem("theme", theme);
  }
  public get theme() {
    return getTheme(this.colorMode);
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

  public setIsDirty = (isDirty = true) => {
    this.isDirty = isDirty;
  };

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
    await this.config.storageBackend?.persist("/editor", () =>
      this.editor.toJSON(),
    );
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
    this.shouldPersist = false;
    const tab = await new Tab().register();

    const theme = localStorage.getItem("theme");
    if (theme) this.setColorMode(theme as ColorMode, false);

    if (tab.isMainTab) return;

    const editorSnapshot = await this.config.storageBackend?.retrieve(
      "/editor",
    );
    if (editorSnapshot) {
      await this.editor.applySnapshot(editorSnapshot as EditorSnapshot);
    }
    this.shouldPersist = true;
  }

  public destroy = async () => {
    if (!this.shouldPersist) return;
    // eslint-disable-next-line no-alert
    if (!window.confirm("Erase all application data?")) return;

    this.shouldPersist = false;
    localStorage.clear();
    await this.config.storageBackend?.clear();

    window.location.reload();
  };
}
