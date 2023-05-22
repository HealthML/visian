import {
  ColorMode,
  ErrorNotification,
  getTheme,
  i18n,
  IDispatch,
  IStorageBackend,
  Tab,
} from "@visian/ui-shared";
import {
  createFileFromBase64,
  createTaskFromWHO,
  deepObserve,
  getBase64DataForAnnotation,
  getBase64DataForImage,
  getWHOTask,
  IDisposable,
  ISerializable,
  Task,
  TaskType,
  TaskTypeWHO,
  TaskWHO,
} from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";

import { errorDisplayDuration } from "../constants";
import { DICOMWebServer } from "./dicomweb-server";
import { Editor, EditorSnapshot } from "./editor";
import { Tracker } from "./tracking";
import { ProgressNotification } from "./types";

export interface RootSnapshot {
  editor: EditorSnapshot;
}

export interface RootStoreConfig {
  previousSnapshot?: RootSnapshot;
  storageBackend?: IStorageBackend;
}

export class RootStore implements ISerializable<RootSnapshot>, IDisposable {
  public dicomWebServer?: DICOMWebServer;

  public editor: Editor;

  /** The current theme. */
  public colorMode: ColorMode = "dark";

  protected errorTimeout?: NodeJS.Timer;
  public error?: ErrorNotification;
  public progress?: ProgressNotification;

  /** Indicates if the last-triggered save succeeded. */
  protected isSaved = true;
  /** Indicates if the last-triggered save used an up-to-date snapshot. */
  protected isSaveUpToDate = true;

  public shouldPersist = false;

  public refs: { [key: string]: React.RefObject<HTMLElement> } = {};
  public pointerDispatch?: IDispatch;

  public currentTaskWHO?: TaskWHO;

  public currentTask?: Task;

  public tracker?: Tracker;

  constructor(protected config: RootStoreConfig = {}) {
    makeObservable<this, "isSaved" | "isSaveUpToDate" | "setIsSaveUpToDate">(
      this,
      {
        dicomWebServer: observable,
        editor: observable,
        colorMode: observable,
        error: observable,
        progress: observable,
        isSaved: observable,
        isSaveUpToDate: observable,
        refs: observable,
        currentTaskWHO: observable,
        currentTask: observable,

        theme: computed,

        connectToDICOMWebServer: action,
        setColorMode: action,
        setError: action,
        setProgress: action,
        applySnapshot: action,
        rehydrate: action,
        setIsDirty: action,
        setIsSaveUpToDate: action,
        setRef: action,
        setCurrentTaskWHO: action,
        setCurrentTask: action,
      },
    );

    this.editor = new Editor(undefined, {
      persist: this.persist,
      persistImmediately: this.persistImmediately,
      setDirty: action(this.setIsDirty),
      getTheme: () => this.theme,
      getRefs: () => this.refs,
      setError: this.setError,
      getTracker: () => this.tracker,
      getColorMode: () => this.colorMode,
    });

    deepObserve(this.editor, this.persist, {
      exclusionAttribute: "excludeFromSnapshotTracking",
    });
  }

  public dispose() {
    this.editor.dispose();
    this.tracker?.dispose();
  }

  /**
   * Connects to a DICOMweb server.
   * If no URL is given, disconnects from the current server (if any).
   *
   * @param url The server's URL
   * @param shouldPersist Indicates if the new URL should be persisted.
   * Defaults to `true`.
   */
  public async connectToDICOMWebServer(url?: string, shouldPersist = true) {
    if (url) this.setProgress({ labelTx: "connecting", showSplash: true });
    this.dicomWebServer = url ? await DICOMWebServer.connect(url) : undefined;
    if (url) this.setProgress();

    if (shouldPersist && this.shouldPersist) {
      if (url) {
        localStorage.setItem("dicomWebServer", url);
      } else {
        localStorage.removeItem("dicomWebServer");
      }
    }
  }

  public setColorMode(theme: ColorMode, shouldPersist = true) {
    this.colorMode = theme;
    if (shouldPersist && this.shouldPersist) {
      localStorage.setItem("theme", theme);
    }
  }

  public get theme() {
    return getTheme(this.colorMode);
  }

  public setError = (error?: ErrorNotification) => {
    this.error = error;

    if (this.errorTimeout !== undefined) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = undefined;
    }
    if (error) {
      this.errorTimeout = setTimeout(() => {
        this.setError();
      }, errorDisplayDuration) as unknown as NodeJS.Timer;
    }
  };

  public setProgress(progress?: ProgressNotification) {
    this.progress = progress;
  }

  public initializeTracker() {
    if (this.tracker) return;
    this.tracker = new Tracker(this.editor);
    this.tracker.startSession();
  }

  public async loadWHOTask(taskId: string) {
    if (!taskId) return;

    try {
      if (this.editor.newDocument(true)) {
        this.setProgress({ labelTx: "importing", showSplash: true });
        const taskJson = await getWHOTask(taskId);
        // We want to ignore possible other annotations if type is "CREATE"
        if (taskJson.kind === TaskTypeWHO.Create) {
          taskJson.annotations = [];
        }
        const whoTask = new TaskWHO(taskJson);
        this.setCurrentTaskWHO(whoTask);

        const task = createTaskFromWHO(whoTask);
        this.setCurrentTask(task);

        await Promise.all(
          task.images.map(async (image) => {
            await this.editor.activeDocument?.importFiles(
              createFileFromBase64(
                image.title,
                getBase64DataForImage(image.id, whoTask),
              ),
              undefined,
              false,
            );
          }),
        );

        if (task.kind === TaskType.Create) {
          this.editor.activeDocument?.finishBatchImport();
          // this.currentTaskWHO?.addNewAnnotation();
        } else {
          // Task Type is Correct or Review
          await Promise.all(
            task.images.map(async (image, index) => {
              const title = image.title || `annotation_${index}`;

              await Promise.all(
                image.annotations.map(async (annotation) => {
                  const createdLayerId =
                    await this.editor.activeDocument?.importFiles(
                      createFileFromBase64(
                        title.replace(".nii", "_annotation").concat(".nii"),
                        getBase64DataForAnnotation(
                          annotation.id,
                          image.id,
                          whoTask,
                        ),
                      ),
                      title.replace(".nii", "_annotation"),
                      true,
                    );
                  if (createdLayerId) annotation.layerId = createdLayerId;
                }),
              );
            }),
          );
        }
      }
    } catch {
      this.setError({
        titleTx: "import-error",
        descriptionTx: "remote-file-error",
      });
      this.editor.setActiveDocument();
    }

    this.setProgress();
  }

  // Persistence

  /**
   * Indicates if there are changes that have not yet been written by the
   * given storage backend.
   */
  public get isDirty() {
    return !(this.isSaved && this.isSaveUpToDate);
  }

  public setIsDirty = (isDirty = true, force = false) => {
    this.isSaved = !isDirty;
    if (force) this.isSaveUpToDate = !isDirty;
  };

  protected setIsSaveUpToDate(value: boolean) {
    this.isSaveUpToDate = value;
  }

  public setRef<T extends HTMLElement>(key: string, ref?: React.RefObject<T>) {
    if (ref) {
      this.refs[key] = ref;
    } else {
      delete this.refs[key];
    }
  }

  public setCurrentTaskWHO(task?: TaskWHO) {
    this.currentTaskWHO = task;
  }

  public setCurrentTask(task?: Task) {
    this.currentTask = task;
  }

  public persist = async () => {
    if (!this.shouldPersist) return;
    this.setIsDirty(true);
    this.setIsSaveUpToDate(false);
    await this.config.storageBackend?.persist("/editor", () => {
      this.setIsSaveUpToDate(true);
      return this.editor.toJSON();
    });
    this.setIsDirty(false);
  };

  public persistImmediately = async () => {
    if (!this.shouldPersist) return;
    this.setIsSaveUpToDate(true);
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

    const dicomWebServer = localStorage.getItem("dicomWebServer");
    if (dicomWebServer) {
      this.connectToDICOMWebServer(dicomWebServer, false);
    }

    const theme = localStorage.getItem("theme");
    if (theme) this.setColorMode(theme as ColorMode, false);

    if (!tab.isMainTab) return;

    const editorSnapshot = await this.config.storageBackend?.retrieve(
      "/editor",
    );
    if (editorSnapshot) {
      await this.editor.applySnapshot(editorSnapshot as EditorSnapshot);
    }
    this.shouldPersist = true;
  }

  public destroy = async (forceDestroy?: boolean) => {
    if (!this.shouldPersist && !forceDestroy) return;
    if (
      !forceDestroy &&
      // eslint-disable-next-line no-alert
      !window.confirm(i18n.t("erase-application-data-confirmation"))
    )
      return;

    this.shouldPersist = false;
    localStorage.clear();
    await this.config.storageBackend?.clear();

    this.setIsDirty(false, true);
    window.location.href = new URL(window.location.href).searchParams.has(
      "tracking",
    )
      ? `${window.location.pathname}?tracking`
      : window.location.pathname;
  };
}
