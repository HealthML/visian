import { Editor } from "./editor";

export class RootStore {
  public editor: Editor;

  constructor() {
    this.editor = new Editor();
  }
}
