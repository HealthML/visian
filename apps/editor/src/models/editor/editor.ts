import { SliceRenderer } from "@visian/rendering";
import { IEditor, ISliceRenderer, Theme } from "@visian/ui-shared";
import { IDisposable, ISerializable } from "@visian/utils";
import { action, makeObservable, observable } from "mobx";
import * as THREE from "three";

import { StoreContext } from "../types";
import { Document, DocumentSnapshot } from "./document";

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

  public sliceRenderer: ISliceRenderer;
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
    this.sliceRenderer = new SliceRenderer(this);

    this.applySnapshot(snapshot);
  }

  public dispose(): void {
    this.sliceRenderer?.dispose();
  }

  public setActiveDocument(value?: Document): void {
    this.activeDocument = value;
  }

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
        : new Document(undefined, this, this.context),
    );
    return Promise.resolve();
  }
}
