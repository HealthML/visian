import { ViewType } from "@visian/utils";
import { reaction } from "mobx";

import { brushSizePreviewTime } from "../../../constants";
import { Editor } from "../../../models";
import { BrushCursor } from "./brush-cursor";

export class PreviewBrushCursor extends BrushCursor {
  private timeout?: NodeJS.Timeout;

  private active = false;

  constructor(editor: Editor, viewType: ViewType) {
    super(editor, viewType);
    this.disposers.push(
      reaction(
        () => editor.viewSettings.mainViewType,
        (mainView: ViewType) => {
          if (mainView !== this.viewType) this.hide();
        },
      ),
      reaction(
        () => editor.tools.isCursorOverDrawableArea && this.active,
        () => {
          this.updateVisibility();
        },
      ),
    );

    this.visible = false;
  }

  public show() {
    this.active = true;
    this.updateVisibility();

    if (this.timeout !== undefined) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.active = false;
      this.updateVisibility();
    }, brushSizePreviewTime);
  }

  private hide() {
    this.active = false;
    this.updateVisibility();

    if (this.timeout !== undefined) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
  }

  protected updateVisibility() {
    this.visible = this.active && !this.editor.tools.isCursorOverDrawableArea;

    // Prevent appearing again after hiding because main brush cursor was visible.
    if (this.editor.tools.isCursorOverDrawableArea && this.active) {
      this.hide();
    }

    this.editor.sliceRenderer?.lazyRender();
  }
}
