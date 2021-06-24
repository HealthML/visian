import { SliceRenderer, VolumeRenderer } from "@visian/rendering";
import {
  IEditor,
  ISliceRenderer,
  Theme,
  IVolumeRenderer,
} from "@visian/ui-shared";
import { IDisposable, ISerializable } from "@visian/utils";
import { action, makeObservable, observable } from "mobx";
import * as THREE from "three";

import { StoreContext } from "../types";
import { Document, DocumentSnapshot } from "./document";
import { ImageLayer } from "./layers";

export interface EditorSnapshot {
  activeDocument?: DocumentSnapshot;
}

export class Editor
  implements IEditor, ISerializable<EditorSnapshot>, IDisposable {
  public readonly excludeFromSnapshotTracking = [
    "context",
    "sliceRenderer",
    "renderers",
  ];

  public activeDocument?: Document;

  public sliceRenderer?: ISliceRenderer;
  public volumeRenderer?: IVolumeRenderer;
  public renderers: [
    THREE.WebGLRenderer,
    THREE.WebGLRenderer,
    THREE.WebGLRenderer,
  ];

  constructor(
    snapshot: EditorSnapshot | undefined,
    protected context: StoreContext,
  ) {
    makeObservable(this, {
      activeDocument: observable,
      renderers: observable,

      setActiveDocument: action,
    });

    this.renderers = [
      new THREE.WebGLRenderer({ alpha: true }),
      new THREE.WebGLRenderer({ alpha: true }),
      new THREE.WebGLRenderer({ alpha: true }),
    ];
    this.renderers.forEach((renderer) => {
      renderer.setClearAlpha(0);
    });
    this.sliceRenderer = new SliceRenderer(this);
    this.volumeRenderer = new VolumeRenderer(this);

    this.renderers[0].setAnimationLoop(this.animate);

    this.applySnapshot(snapshot);
  }

  public dispose(): void {
    this.sliceRenderer?.dispose();
  }

  public setActiveDocument(
    value = new Document(undefined, this, this.context),
  ): void {
    this.activeDocument = value;
  }

  public newDocument = (forceDestroy?: boolean) => {
    // eslint-disable-next-line no-alert
    if (forceDestroy || window.confirm("Discard the current document?")) {
      this.setActiveDocument();
    }
  };

  // Proxies
  public get refs(): { [name: string]: React.RefObject<HTMLElement> } {
    return this.context.getRefs();
  }

  public get theme(): Theme {
    return this.context.getTheme();
  }

  // Serialization
  public toJSON(): EditorSnapshot {
    return {
      activeDocument: this.activeDocument?.toJSON(),
    };
  }

  public applySnapshot(snapshot?: Partial<EditorSnapshot>): Promise<void> {
    this.setActiveDocument(
      snapshot?.activeDocument
        ? new Document(snapshot.activeDocument, this, this.context)
        : undefined,
    );
    return Promise.resolve();
  }

  private animate = () => {
    this.activeDocument?.tools.toolRenderer.render();
    this.activeDocument?.tools.regionGrowingRenderer.render();
    this.activeDocument?.layers
      .filter((layer) => layer.kind === "image")
      .forEach((imageLayer) => (imageLayer as ImageLayer).image.render());
    this.sliceRenderer?.animate();
    this.volumeRenderer?.animate();
  };
}
