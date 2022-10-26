import {
  RenderedImage,
  SliceRenderer,
  VolumeRenderer,
} from "@visian/rendering";
import {
  ColorMode,
  i18n,
  IEditor,
  ISliceRenderer,
  IVolumeRenderer,
  PerformanceMode,
  Theme,
} from "@visian/ui-shared";
import { IDisposable, ISerializable } from "@visian/utils";
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import * as THREE from "three";

import { StoreContext } from "../types";
import { Document, DocumentSnapshot } from "./document";

export interface EditorSnapshot {
  activeDocument?: DocumentSnapshot;

  performanceMode: PerformanceMode;
}

export class Editor
  implements IEditor, ISerializable<EditorSnapshot>, IDisposable
{
  public readonly excludeFromSnapshotTracking = [
    "context",
    "sliceRenderer",
    "volumeRenderer",
    "renderer",
  ];

  public activeDocument?: Document;

  public sliceRenderer?: ISliceRenderer;
  public volumeRenderer?: IVolumeRenderer;
  public renderer!: THREE.WebGLRenderer;
  public isAvailable!: boolean;

  public performanceMode: PerformanceMode = "high";

  constructor(
    snapshot: EditorSnapshot | undefined,
    protected context: StoreContext,
  ) {
    makeObservable(this, {
      activeDocument: observable,
      renderer: observable,
      sliceRenderer: observable,
      volumeRenderer: observable,
      performanceMode: observable,
      isAvailable: observable,

      colorMode: computed,

      setActiveDocument: action,
      setPerformanceMode: action,
      applySnapshot: action,
    });

    runInAction(() => {
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        preserveDrawingBuffer: true,
      });
      this.isAvailable = this.renderer.capabilities.isWebGL2;

      if (this.isAvailable) {
        this.renderer.setClearAlpha(0);

        this.sliceRenderer = new SliceRenderer(this);
        this.volumeRenderer = new VolumeRenderer(this);

        this.renderer.setAnimationLoop(this.animate);
      }
    });

    this.applySnapshot(snapshot);
  }

  public dispose(): void {
    this.sliceRenderer?.dispose();
    this.volumeRenderer?.dispose();
    this.activeDocument?.dispose();
    this.renderer.dispose();
  }

  public setActiveDocument(
    // eslint-disable-next-line default-param-last
    value = new Document(undefined, this, this.context),
    isSilent?: boolean,
  ): void {
    this.activeDocument?.dispose();
    this.activeDocument = value;

    if (!isSilent) this.activeDocument.requestSave();
  }

  public newDocument = (forceDestroy?: boolean) => {
    if (
      forceDestroy ||
      // eslint-disable-next-line no-alert
      window.confirm(i18n.t("discard-current-document-confirmation"))
    ) {
      this.setActiveDocument();
      return true;
    }
    return false;
  };

  // Proxies
  public get refs(): { [name: string]: React.RefObject<HTMLElement> } {
    return this.context.getRefs();
  }

  public get theme(): Theme {
    return this.context.getTheme();
  }

  public get colorMode(): ColorMode {
    return this.context.getColorMode();
  }

  // Performance Mode
  public setPerformanceMode = (mode: PerformanceMode = "high") => {
    this.performanceMode = mode;
  };

  // Serialization
  public toJSON(): EditorSnapshot {
    return {
      activeDocument: this.activeDocument?.toJSON(),
      performanceMode: this.performanceMode,
    };
  }

  public applySnapshot(snapshot?: Partial<EditorSnapshot>): Promise<void> {
    if (this.isAvailable) {
      this.setActiveDocument(
        snapshot?.activeDocument
          ? new Document(snapshot.activeDocument, this, this.context)
          : undefined,
        true,
      );
      this.setPerformanceMode(snapshot?.performanceMode);
    } else {
      this.context.setError({
        titleTx: "browser-error",
        descriptionTx: "no-webgl-2-error",
      });
    }

    return Promise.resolve();
  }

  private animate = () => {
    this.activeDocument?.tools.toolRenderer.render();
    this.activeDocument?.tools.regionGrowingRenderer.render();
    this.activeDocument?.imageLayers.forEach((imageLayer) =>
      (imageLayer.image as RenderedImage).render(),
    );
    this.sliceRenderer?.animate();
    this.volumeRenderer?.animate();
  };
}
