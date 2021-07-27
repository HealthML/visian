import { RegionGrowingRenderer3D } from "@visian/rendering";
import { DragPoint, IDocument, IImageLayer } from "@visian/ui-shared";
import { AtlasCommand } from "../history";
import { Tool } from "./tool";

export class SmartBrush3D<
  N extends "smart-brush-3d" = "smart-brush-3d"
> extends Tool<N> {
  public readonly excludeFromSnapshotTracking = [
    "document",
    "regionGrowingRenderer",
  ];

  private isSeedSet = false;

  constructor(
    document: IDocument,
    private regionGrowingRenderer: RegionGrowingRenderer3D,
  ) {
    super(
      {
        name: "smart-brush-3d" as N,
        icon: "smartBrush3D",
        supportedViewModes: ["2D"],
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

    this.regionGrowingRenderer.setSeed(dragPoint);
    this.isSeedSet = true;
  }

  public endAt(_dragPoint: DragPoint): void {
    if (this.isSeedSet) {
      this.document.viewSettings.setViewMode("3D");
      this.document.viewport3D.setActiveTransferFunction("fc-edges");
      this.regionGrowingRenderer.doRegionGrowing(
        this.document.tools.smartBrushThreshold,
      );
      this.isSeedSet = false;
    }
  }

  public submit = () => {
    const imageLayer = this.document.activeLayer;
    if (!imageLayer || imageLayer.kind !== "image") return;
    const { image } = imageLayer as IImageLayer;
    const oldAtlas = new Uint8Array(image.getAtlas());

    this.regionGrowingRenderer.flushToAnnotation();

    const newAtlas = new Uint8Array(image.getAtlas());
    this.document.history.addCommand(
      new AtlasCommand(
        {
          layerId: imageLayer.id,
          oldAtlas,
          newAtlas,
        },
        this.document,
      ),
    );

    (imageLayer as IImageLayer).recomputeSliceMarkers(
      undefined,
      undefined,
      false,
    );
  };
}
