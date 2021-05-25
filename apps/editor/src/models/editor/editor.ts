import { IEditor, ISliceRenderer, Theme } from "@visian/ui-shared";
import { ISerializable } from "@visian/utils";
import { action, makeObservable, observable } from "mobx";
import { StoreContext } from "../types";

import { Document, DocumentSnapshot } from "./document";

export interface EditorSnapshot {
  activeDocument?: DocumentSnapshot;
}

export class Editor implements IEditor, ISerializable<EditorSnapshot> {
  public readonly excludeFromSnapshotTracking = ["context"];

  public activeDocument?: Document;

  public sliceRenderer?: ISliceRenderer;
  public renderers?: THREE.WebGLRenderer[];

  constructor(
    snapshot: EditorSnapshot | undefined,
    protected context: StoreContext,
  ) {
    this.applySnapshot(snapshot);

    makeObservable(this, {
      activeDocument: observable,
      sliceRenderer: observable,
      renderers: observable,

      setActiveDocument: action,
      setSliceRenderer: action,
    });
  }

  public setActiveDocument(value?: Document): void {
    this.activeDocument = value;
  }

  public setSliceRenderer(sliceRenderer?: ISliceRenderer): void {
    this.sliceRenderer = sliceRenderer;
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
        ? new Document(snapshot.activeDocument, this)
        : new Document(undefined, this),
    );
    return Promise.resolve();
  }
}
