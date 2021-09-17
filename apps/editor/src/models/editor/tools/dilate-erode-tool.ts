import { DilateErodeRenderer3D } from "@visian/rendering";
import { IDocument, IImageLayer, ITool } from "@visian/ui-shared";
import { AtlasCommand } from "../history";
import { Tool } from "./tool";

export class DilateErodeTool<
  N extends "dilate-erode" = "dilate-erode"
> extends Tool<N> {
  public readonly excludeFromSnapshotTracking = [
    "document",
    "dilateErodeRenderer",
  ];

  protected previousTool?: N;

  constructor(
    document: IDocument,
    protected dilateErodeRenderer: DilateErodeRenderer3D,
  ) {
    super(
      {
        name: "dilate-erode" as N,
        icon: "crosshair",
        labelTx: "dilate-erode",
        supportedViewModes: ["2D", "3D"],
        supportedLayerKinds: ["image"],
      },
      document,
    );
  }

  public activate(previousTool?: ITool<N>) {
    this.previousTool = previousTool?.name;

    const sourceLayer = this.document.activeLayer;
    if (
      sourceLayer &&
      this.document.activeLayer?.kind === "image" &&
      this.document.activeLayer.isAnnotation
    ) {
      this.dilateErodeRenderer.setSourceLayer(sourceLayer as IImageLayer);
      this.dilateErodeRenderer.render();
    } else {
      this.document.tools.setActiveTool(previousTool);
    }
  }

  public submit = () => {
    const imageLayer = this.document.activeLayer;
    if (!imageLayer || imageLayer.kind !== "image") return;
    const { image } = imageLayer as IImageLayer;
    const oldAtlas = new Uint8Array(image.getAtlas());

    this.dilateErodeRenderer.flushToAnnotation(imageLayer as IImageLayer, true);

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

    this.document.tools.setActiveTool(this.previousTool);
  };

  public discard = () => {
    this.document.tools.dilateErodeRenderer3D.discard();
    this.document.tools.setActiveTool(this.previousTool);
  };

  public deactivate() {
    this.document.tools.dilateErodeRenderer3D.discard();
  }
}
