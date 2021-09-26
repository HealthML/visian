import {
  IDocument,
  IImageLayer,
  IUndoRedoCommand,
  IUndoRedoCommandSnapshot,
} from "@visian/ui-shared";
import { ISerializable } from "@visian/utils";

export interface AtlasCommandSnapshot extends IUndoRedoCommandSnapshot {
  kind: "atlas";

  layerId: string;
  oldAtlas: Uint8Array;
  newAtlas: Uint8Array;
}

export class AtlasCommand
  implements IUndoRedoCommand, ISerializable<AtlasCommandSnapshot> {
  public readonly excludeFromSnapshotTracking = ["document"];

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public static readonly kind = "atlas";
  public readonly kind = "atlas";

  public readonly layerId: string;
  protected readonly oldAtlas: Uint8Array;
  protected readonly newAtlas: Uint8Array;

  constructor(
    snapshot: Omit<AtlasCommandSnapshot, "kind">,
    protected readonly document: IDocument,
  ) {
    this.layerId = snapshot.layerId;
    this.oldAtlas = snapshot.oldAtlas;
    this.newAtlas = snapshot.newAtlas;
  }

  public undo(): void {
    this.document.setActiveLayer(this.layerId);
    const imageLayer = this.document.getLayer(this.layerId) as
      | IImageLayer
      | undefined;
    imageLayer?.setAtlas?.(this.oldAtlas);

    this.onUndoOrRedo(imageLayer);
  }

  public redo(): void {
    this.document.setActiveLayer(this.layerId);
    const imageLayer = this.document.getLayer(this.layerId) as
      | IImageLayer
      | undefined;
    imageLayer?.setAtlas?.(this.newAtlas);

    this.onUndoOrRedo(imageLayer);
  }

  private onUndoOrRedo(imageLayer?: IImageLayer) {
    this.document.sliceRenderer?.lazyRender();
    this.document.volumeRenderer?.lazyRender(true);
    imageLayer?.recomputeSliceMarkers();
  }

  // Serialization
  public toJSON(): AtlasCommandSnapshot {
    return {
      kind: this.kind,
      layerId: this.layerId,
      oldAtlas: this.oldAtlas,
      newAtlas: this.newAtlas,
    };
  }

  public async applySnapshot(): Promise<void> {
    throw new Error("Undo/redo commands are immutable.");
  }
}
