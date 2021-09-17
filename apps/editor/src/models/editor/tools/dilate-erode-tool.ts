import { DilateErodeRenderer3D } from "@visian/rendering";
import { IDocument, IImageLayer, ITool } from "@visian/ui-shared";
import { AtlasCommand } from "../history";
import { SelfDeactivatingTool } from "./self-deactivating-tool";

export class DilateErodeTool<
  N extends "dilate-erode"
> extends SelfDeactivatingTool<N> {
  public readonly excludeFromSnapshotTracking = [
    "document",
    "dilateErodeRenderer",
  ];

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
    const sourceLayer = this.document.activeLayer;
    if (
      sourceLayer &&
      this.document.activeLayer?.kind === "image" &&
      this.document.activeLayer.isAnnotation
    ) {
      this.dilateErodeRenderer.setShouldErode(true);
      this.dilateErodeRenderer.render(sourceLayer as IImageLayer);
      this.submit();
    }

    super.activate(previousTool);
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
  };
}
