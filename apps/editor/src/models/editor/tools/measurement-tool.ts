import { DragPoint, IDocument, IPreviewedTool } from "@visian/ui-shared";
import { Vector } from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";
import { Tool } from "./tool";
import { dragPointsEqual } from "./utils";

export class MeasurementTool<N extends "measurement-tool" = "measurement-tool">
  extends Tool<N>
  implements IPreviewedTool<N> {
  public readonly excludeFromSnapshotTracking = [
    "document",
    "path",
    "lastPoint",
  ];

  private lastPoint?: DragPoint;

  public path: Vector[] = [];

  constructor(document: IDocument) {
    super(
      {
        name: "measurement-tool" as N,
        icon: "arrowUp", // Todo: Add icon
        supportedViewModes: ["2D"],
        supportedLayerKinds: ["image"],
      },
      document,
    );

    makeObservable<this>(this, {
      path: observable,

      hasPath: computed,
      pathLength: computed,

      startAt: action,
      moveTo: action,
      endAt: action,
      discard: action,
    });
  }

  public get hasPath() {
    return this.path.length > 1;
  }

  public get pathLength() {
    if (!this.hasPath) return 0;

    const scale =
      this.document.baseImageLayer?.image.voxelSpacing ||
      new Vector([1, 1, 1], false);

    return this.path
      .slice(1)
      .map((pointB, pointAIndex) =>
        pointB
          .clone(false)
          .sub(this.path[pointAIndex])
          .multiply(scale)
          .length(),
      )
      .reduce((previous, current) => previous + current);
  }

  private addDragPointToPath(dragPoint: DragPoint) {
    this.path.push(Vector.fromObject(dragPoint, false));
  }

  public startAt(dragPoint: DragPoint) {
    this.addDragPointToPath(dragPoint);
    this.onPathChange();

    this.lastPoint = dragPoint;
  }

  public moveTo(dragPoint: DragPoint) {
    if (!this.lastPoint || dragPointsEqual(this.lastPoint, dragPoint)) return;

    this.path.pop();
    this.addDragPointToPath(dragPoint);
    this.onPathChange();

    this.lastPoint = dragPoint;
  }

  public endAt(dragPoint: DragPoint | null) {
    if (dragPoint) this.moveTo(dragPoint);

    const pathLength = this.path.length;
    if (
      pathLength > 1 &&
      this.path[pathLength - 1].equals(this.path[pathLength - 2])
    ) {
      this.path.pop();
    }
  }

  public discard = () => {
    this.path = [];
    this.onPathChange();
  };

  public submit = () => {
    this.discard();
  };

  public deactivate() {
    this.discard();
  }

  private onPathChange() {
    // Todo: Update preview
  }
}
