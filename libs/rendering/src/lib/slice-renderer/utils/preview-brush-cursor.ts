import { IEditor } from "@visian/ui-shared";
import { ViewType } from "@visian/utils";
import { reaction } from "mobx";

import { BrushCursor } from "./brush-cursor";

/** The amount of time the brush cursor preview is shown (in ms). */
export const brushSizePreviewTime = 1000;

export class PreviewBrushCursor extends BrushCursor {
  private timeout?: NodeJS.Timeout;

  private active = false;

  constructor(editor: IEditor, viewType: ViewType, material: THREE.Material) {
    super(editor, viewType, material);
    this.disposers.push(
      reaction(
        () => editor.activeDocument?.viewport2D.mainViewType,
        (mainView?: ViewType) => {
          if (mainView !== this.viewType) this.hide();
        },
      ),
      reaction(
        () => editor.activeDocument?.tools.canDraw && this.active,
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
    this.visible = this.active && !this.editor.activeDocument?.tools.canDraw;

    // Prevent appearing again after hiding because main brush cursor was visible.
    if (this.editor.activeDocument?.tools.canDraw && this.active) {
      this.hide();
    }

    this.editor.sliceRenderer?.lazyRender();
  }
}
