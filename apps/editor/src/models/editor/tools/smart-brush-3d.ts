import { RegionGrowingRenderer3D } from "@visian/rendering";
import {
  DragPoint,
  IDocument,
  IImageLayer,
  IPreviewedTool,
} from "@visian/ui-shared";

import { Tool } from "./tool";
import { mutateAtlas } from "./utils";

export class SmartBrush3D<N extends "smart-brush-3d" = "smart-brush-3d">
  extends Tool<N>
  implements IPreviewedTool<N> {
  public readonly excludeFromSnapshotTracking = ["document", "renderer"];

  private isSeedSet = false;

  constructor(document: IDocument, private renderer: RegionGrowingRenderer3D) {
    super(
      {
        name: "smart-brush-3d" as N,
        icon: "smartBrush3D",
        supportedViewModes: ["2D", "3D"],
        supportedLayerKinds: ["image"],
        isDrawingTool: true,
        isBrush: true,
        isSmartBrush: true,
      },
      document,
    );
  }

  public startAt(dragPoint: DragPoint): void {
    if (this.document.activeLayer?.kind !== "image") return;

    const { voxelCount } = (this.document.activeLayer as IImageLayer).image;
    if (
      dragPoint.x < 0 ||
      dragPoint.x >= voxelCount.x ||
      dragPoint.y < 0 ||
      dragPoint.y >= voxelCount.y ||
      dragPoint.z < 0 ||
      dragPoint.z >= voxelCount.z
    ) {
      return;
    }

    this.renderer.setSeed(dragPoint);
    this.isSeedSet = true;
  }

  public endAt(_dragPoint: DragPoint): void {
    if (this.isSeedSet) {
      this.renderer.setThreshold(this.document.tools.smartBrushThreshold);
      this.renderer.render();
      this.isSeedSet = false;
    }
  }

  public submit = () => {
    const targetLayer = this.document.activeLayer;
    mutateAtlas(
      targetLayer as IImageLayer,
      () => this.renderer.flushToAnnotation(),
      this.document,
    );
  };

  public discard() {
    this.renderer.discard();
  }

  public deactivate() {
    this.renderer.discard();
  }
}
