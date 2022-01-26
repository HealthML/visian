import { RenderedImage } from "@visian/rendering";
import {
  IDocument,
  IImageLayer,
  IUndoRedoCommand,
  IUndoRedoCommandSnapshot,
} from "@visian/ui-shared";
import { ISerializable } from "@visian/utils";

export interface ImageCommandSnapshot extends IUndoRedoCommandSnapshot {
  kind: "image";

  layerId: string;
  oldData: Uint8Array;
  newData: Uint8Array;
}

export class ImageCommand
  implements IUndoRedoCommand, ISerializable<ImageCommandSnapshot> {
  public readonly excludeFromSnapshotTracking = ["document"];

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public static readonly kind = "image";
  public readonly kind = "image";

  public readonly layerId: string;
  protected readonly oldData: Uint8Array;
  protected readonly newData: Uint8Array;

  constructor(
    snapshot: Omit<ImageCommandSnapshot, "kind">,
    protected readonly document: IDocument,
  ) {
    this.layerId = snapshot.layerId;
    this.oldData = snapshot.oldData;
    this.newData = snapshot.newData;
  }

  public undo(): void {
    this.document.setActiveLayer(this.layerId);
    const imageLayer = this.document.getLayer(this.layerId) as
      | IImageLayer
      | undefined;
    (imageLayer?.image as RenderedImage | undefined)?.setTextureData(
      this.oldData,
    );

    this.onUndoOrRedo(imageLayer);
  }

  public redo(): void {
    this.document.setActiveLayer(this.layerId);
    const imageLayer = this.document.getLayer(this.layerId) as
      | IImageLayer
      | undefined;
    (imageLayer?.image as RenderedImage | undefined)?.setTextureData(
      this.newData,
    );

    this.onUndoOrRedo(imageLayer);
  }

  private onUndoOrRedo(imageLayer?: IImageLayer) {
    this.document.sliceRenderer?.lazyRender();
    this.document.volumeRenderer?.lazyRender(true);
    imageLayer?.recomputeSliceMarkers();
  }

  // Serialization
  public toJSON(): ImageCommandSnapshot {
    return {
      kind: this.kind,
      layerId: this.layerId,
      oldData: this.oldData,
      newData: this.newData,
    };
  }

  public async applySnapshot(): Promise<void> {
    throw new Error("Undo/redo commands are immutable.");
  }
}
