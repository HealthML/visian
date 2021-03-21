import { action, makeObservable, observable } from "mobx";

import { Editor, EditorSnapshot } from "./editor";
import { ISerializable } from "./types";

export interface RootSnapshot {
  editor: EditorSnapshot;
}

export class RootStore implements ISerializable<RootSnapshot> {
  public editor: Editor;

  constructor() {
    this.editor = new Editor();

    makeObservable(this, { editor: observable, rehydrate: action });
  }

  public toJSON() {
    return { editor: this.editor.toJSON() };
  }

  public async rehydrate(snapshot: RootSnapshot) {
    await this.editor.rehydrate(snapshot.editor);
  }
}
