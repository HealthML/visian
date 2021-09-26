import { IDocument } from "@visian/ui-shared";
import { Tool } from "./tool";

export class PlaneTool extends Tool<"plane-tool"> {
  constructor(document: IDocument) {
    super(
      {
        name: "plane-tool",
        icon: "planeTool",
        labelTx: "plane-tool",
        supportedViewModes: ["3D"],
      },
      document,
    );
  }

  public activate() {
    this.document.viewport3D.setShouldClippingPlaneRender(true);
    this.document.viewport3D.setClippingPlaneNormalToFaceCamera();
  }
}
