import { ToolRenderer } from "@visian/rendering";
import { IDocument, ITool } from "@visian/ui-shared";
import { action, makeObservable, observable } from "mobx";

import { Tool } from "./tool";

export type SAMToolMode = "bounding-box" | "points";

export class SAMTool<N extends "sam-tool" = "sam-tool"> extends Tool<N> {
  public readonly excludeFromSnapshotTracking = ["toolRenderer", "document"];

  protected previousTool?: N;

  public mode: SAMToolMode = "bounding-box";

  constructor(document: IDocument, public toolRenderer: ToolRenderer) {
    super(
      {
        name: "sam-tool" as N,
        icon: "copilot",
        labelTx: "sam-tool",
        supportedViewModes: ["2D"],
        supportedLayerKinds: ["image"],
        supportAnnotationsOnly: true,
        activationKeys: "",
      },
      document,
    );

    makeObservable(this, {
      mode: observable,
      setMode: action,
    });
  }

  public setMode(mode: SAMToolMode) {
    this.mode = mode;
  }

  public activate(previousTool?: ITool<N>) {
    this.previousTool = previousTool?.name;

    const targetLayer = this.document.activeLayer;
    if (
      targetLayer &&
      this.document.activeLayer?.kind === "image" &&
      this.document.activeLayer.isAnnotation &&
      this.document.activeLayer.isVisible
    ) {
      this.toolRenderer.render();
    } else {
      this.document.tools.setActiveTool(previousTool);
      this.document.setShowLayerMenu(true);
    }
  }

  public close = () => {
    this.document.tools.setActiveTool(this.previousTool);
  };

  public submit = () => {
    console.log("submitted");
  };

  public discard = () => {
    console.log("discarded");
  };

  public deactivate() {
    this.discard();
  }

  public accept() {
    console.log("Annotation accepted.");
  }
}
