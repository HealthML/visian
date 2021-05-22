import { IDocument } from "@visian/ui-shared";
import { ViewType } from "@visian/utils";
import { reaction } from "mobx";

import { brushSizePreviewTime } from "../../../constants";
import { BrushCursor } from "./brush-cursor";

export class PreviewBrushCursor extends BrushCursor {
  private timeout?: NodeJS.Timeout;

  private active = false;

  constructor(document: IDocument, viewType: ViewType) {
    super(document, viewType);
    this.disposers.push(
      reaction(
        () => document.viewport2D.mainViewType,
        (mainView: ViewType) => {
          if (mainView !== this.viewType) this.hide();
        },
      ),
      reaction(
        () => document.tools.canDraw && this.active,
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
    this.visible = this.active && !this.document.tools.canDraw;

    // Prevent appearing again after hiding because main brush cursor was visible.
    if (this.document.tools.canDraw && this.active) {
      this.hide();
    }

    this.document.sliceRenderer?.lazyRender();
  }
}
