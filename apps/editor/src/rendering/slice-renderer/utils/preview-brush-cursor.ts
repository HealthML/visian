import { ViewType } from "@visian/utils";
import { reaction } from "mobx";

import { Editor } from "../../../models";
import { brushSizePreviewTime } from "../../../theme";
import { BrushCursor } from "./brush-cursor";

export class PreviewBrushCursor extends BrushCursor {
  private timeout?: NodeJS.Timeout;

  constructor(editor: Editor, viewType: ViewType) {
    super(editor, viewType);
    this.disposers.push(
      reaction(
        () => editor.viewSettings.mainViewType,
        (mainView: ViewType) => {
          if (mainView !== this.viewType) this.hide();
        },
      ),
    );

    this.visible = false;
  }

  public show() {
    this.visible = true;

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }

    this.timeout = setTimeout(() => {
      this.visible = false;
      this.editor.sliceRenderer?.lazyRender();
    }, brushSizePreviewTime);

    this.editor.sliceRenderer?.lazyRender();
  }

  private hide() {
    this.visible = false;

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }

    this.editor.sliceRenderer?.lazyRender();
  }

  protected updateVisibility() {
    // Visibility is controlled manually, thus the autorun is empty.
  }
}
