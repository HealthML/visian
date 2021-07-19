import {
  IDocument,
  IImageLayer,
  IUndoRedoCommand,
  IUndoRedoCommandSnapshot,
} from "@visian/ui-shared";
import { ISerializable, ViewType } from "@visian/utils";

export interface SliceCommandSnapshot extends IUndoRedoCommandSnapshot {
  kind: "slice";

  layerId: string;
  viewType: ViewType;
  slice: number;
  oldSliceData: Uint8Array;
  newSliceData?: Uint8Array;
}

export class SliceCommand
  implements IUndoRedoCommand, ISerializable<SliceCommandSnapshot> {
  public readonly excludeFromSnapshotTracking = ["document"];

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public static readonly kind = "slice";
  public readonly kind = "slice";

  public readonly layerId: string;
  public readonly viewType: ViewType;
  public readonly slice: number;
  protected readonly oldSliceData: Uint8Array;
  protected readonly newSliceData?: Uint8Array;

  constructor(
    snapshot: Omit<SliceCommandSnapshot, "kind">,
    protected readonly document: IDocument,
  ) {
    this.layerId = snapshot.layerId;
    this.viewType = snapshot.viewType;
    this.slice = snapshot.slice;
    this.oldSliceData = snapshot.oldSliceData;
    this.newSliceData = snapshot.newSliceData;
  }

  public undo(): void {
    this.document.setActiveLayer(this.layerId);
    const imageLayer = this.document.getLayer(this.layerId) as
      | IImageLayer
      | undefined;
    imageLayer?.setSlice?.(this.viewType, this.slice, this.oldSliceData);

    this.onUndoOrRedo(imageLayer);
  }

  public redo(): void {
    this.document.setActiveLayer(this.layerId);
    const imageLayer = this.document.getLayer(this.layerId) as
      | IImageLayer
      | undefined;
    imageLayer?.setSlice?.(this.viewType, this.slice, this.newSliceData);

    this.onUndoOrRedo(imageLayer);
  }

  private onUndoOrRedo(imageLayer?: IImageLayer) {
    this.document.sliceRenderer?.lazyRender();
    this.document.volumeRenderer?.lazyRender(true);
    imageLayer?.recomputeSliceMarkers(this.viewType, this.slice);
  }

  // Serialization
  public toJSON(): SliceCommandSnapshot {
    return {
      kind: this.kind,
      layerId: this.layerId,
      viewType: this.viewType,
      slice: this.slice,
      oldSliceData: this.oldSliceData,
      newSliceData: this.newSliceData,
    };
  }

  public async applySnapshot(): Promise<void> {
    throw new Error("Undo/redo commands are immutable.");
  }
}
