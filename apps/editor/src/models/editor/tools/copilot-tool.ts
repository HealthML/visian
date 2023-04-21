import { ToolRenderer } from "@visian/rendering";
import { IDocument, IImageLayer, ITool } from "@visian/ui-shared";
import {
  findVoxelInSlice,
  getPlaneAxes,
  ViewType,
  Image as VisianImage,
} from "@visian/utils";

import { SelfDeactivatingTool } from "./self-deactivating-tool";

export class CopilotTool<
  N extends "copilot-tool",
> extends SelfDeactivatingTool<N> {
  public readonly excludeFromSnapshotTracking = ["toolRenderer", "document"];

  constructor(document: IDocument, protected toolRenderer: ToolRenderer) {
    super(
      {
        name: "copilot-tool" as N,
        icon: "copilot",
        labelTx: "copilot-tool",
        supportedViewModes: ["2D"],
        supportedLayerKinds: ["image"],
        supportAnnotationsOnly: true,
        activationKeys: "",
      },
      document,
    );
  }

  private singleChannelToRGBA(data: Uint8Array | Float32Array): Uint8Array {
    const rgbaData = new Uint8Array(data.length * 4);
    for (let i = 0; i < data.length; i++) {
      rgbaData[i * 4] = data[i];
      rgbaData[i * 4 + 1] = data[i];
      rgbaData[i * 4 + 2] = data[i];
      rgbaData[i * 4 + 3] = 255;
    }
    return rgbaData;
  }

  private getBase64Image(
    data: Uint8Array | Float32Array,
    width: number,
    height: number,
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create 2D context");
    const rgbaData = this.singleChannelToRGBA(data);
    const clampedData = new Uint8ClampedArray(rgbaData);
    ctx.putImageData(new ImageData(clampedData, width, height), 0, 0);

    return canvas.toDataURL("image/png");
  }

  private logImage(url: string, width: number, height: number) {
    console.log(
      `%cX`,
      `line-height: ${height}px; padding-left: ${width}px; background: url(${url}); background-size: ${width}px ${height}px; color: transparent;`,
    );
  }

  // This is a copy of the method in Image.ts, but it returns a Float32Array.
  // It is unclear why the original method returns a Uint8Array although data can have both types.
  private getSliceData(
    image: VisianImage,
    viewType: ViewType,
    sliceNumber: number,
  ) {
    const [horizontal, vertical] = getPlaneAxes(viewType);
    const sliceData = new Float32Array(
      image.voxelCount[horizontal] *
        image.voxelCount[vertical] *
        image.voxelComponents,
    );

    let index = 0;
    findVoxelInSlice(
      {
        voxelComponents: image.voxelComponents,
        voxelCount: image.voxelCount.clone(false),
      },
      image.getData(),
      viewType,
      sliceNumber,
      (_, value) => {
        for (let c = 0; c < image.voxelComponents; c++) {
          sliceData[index + c] = value.getComponent(c);
          index++;
        }
      },
    );

    return sliceData;
  }

  public activate(previousTool?: ITool<N>) {
    const imageLayer = this.document.mainImageLayer;
    if (!imageLayer) return;

    const { image } = imageLayer as IImageLayer;
    const viewType = this.document.viewport2D.mainViewType;
    const slice = this.document.viewport2D.getSelectedSlice();

    console.log(
      `🤖 Copilot activated. Slice [${slice}]. Viewtype [${viewType}].`,
    );

    const data = this.getSliceData(image, viewType, slice);
    const sliceData = data.map((v) => Math.round(v * 255));

    const url = this.getBase64Image(sliceData, 240, 240);
    this.logImage(url, 500, 500);

    super.activate(previousTool);
  }
}
