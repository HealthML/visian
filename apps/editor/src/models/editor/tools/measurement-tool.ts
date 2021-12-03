import {
  DragPoint,
  IDocument,
  IPreviewedTool,
  ISelfDeactivatingTool,
} from "@visian/ui-shared";
import { Vector } from "@visian/utils";
import { Tool } from "./tool";
import { dragPointsEqual } from "./utils";

export class MeasurementTool<N extends "measurement-tool">
  extends Tool<N>
  implements IPreviewedTool<N>, ISelfDeactivatingTool<N> {
  public readonly excludeFromSnapshotTracking = [
    "document",
    "path",
    "lastPoint",
    "previousTool",
  ];
  public readonly isSelfDeactivating = true;

  private previousTool?: N;

  private lastPoint?: DragPoint;

  private path: Vector[] = [];

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
  }

  public get hasPath() {
    return this.path.length > 1;
  }

  public get pathLength() {
    if (!this.hasPath) return 0;

    return this.path
      .slice(1)
      .map((pointB, pointAIndex) =>
        pointB.clone(false).sub(this.path[pointAIndex]).length(),
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
  }

  public discard = () => {
    this.path = [];
    this.onPathChange();
    this.document.tools.setActiveTool(this.previousTool);
  };

  public submit = () => {
    this.discard();
  };

  private onPathChange() {
    // Todo: Update preview
  }
}
