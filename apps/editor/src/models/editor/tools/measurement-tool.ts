import { DragPoint, IDocument, IMeasurementTool } from "@visian/ui-shared";
import { Vector } from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";

import { Tool } from "./tool";
import { dragPointsEqual } from "./utils";

export class MeasurementTool<N extends "measurement-tool" = "measurement-tool">
  extends Tool<N>
  implements IMeasurementTool
{
  public readonly excludeFromSnapshotTracking = [
    "document",
    "path",
    "lastPoint",
    "draggedVector",
    "isSetToDeleteMode",
  ];

  private lastPoint?: DragPoint;

  private draggedVector?: Vector;

  private isSetToDeleteMode = false;

  public path: Vector[] = [];

  constructor(document: IDocument) {
    super(
      {
        name: "measurement-tool" as N,
        altToolName: "measurement-tool" as N,
        icon: "ruler",
        supportedViewModes: ["2D"],
        supportedLayerKinds: ["image"],
        activationKeys: "l",
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
    return this.path.length > 0;
  }

  public get pathLength() {
    if (this.path.length < 2) return 0;

    const scale =
      this.document.mainImageLayer?.image.voxelSpacing ||
      new Vector([1, 1, 1], false);

    return this.path
      .map((pointA, pointAIndex) =>
        pointA
          .clone(false)
          // Can't slice the array ro remove the redundant last element because it wouldn't trigger recomputation on change
          .sub(this.path[Math.min(pointAIndex + 1, this.path.length - 1)])
          .multiply(scale)
          .length(),
      )
      .reduce((previous, current) => previous + current);
  }

  public get isHoveringNode() {
    const hoveredVoxel = Vector.fromObject(
      this.document.viewport2D.hoveredVoxel,
    );
    return Boolean(this.path.find((node) => node.equals(hoveredVoxel)));
  }

  public setToDeleteMode() {
    this.isSetToDeleteMode = true;
  }

  public startAt(dragPoint: DragPoint) {
    const vector = Vector.fromObject(dragPoint);

    const equalPathVector = this.path.find((pathVector) =>
      pathVector.equals(vector),
    );

    if (equalPathVector) {
      this.draggedVector = equalPathVector;
    } else if (!this.isSetToDeleteMode) {
      this.path.push(vector);
      this.draggedVector = vector;
    }

    this.lastPoint = dragPoint;
  }

  public moveTo(dragPoint: DragPoint) {
    if (
      !this.lastPoint ||
      dragPointsEqual(this.lastPoint, dragPoint) ||
      !this.draggedVector
    ) {
      return;
    }

    this.draggedVector.setFromObject(dragPoint);

    this.lastPoint = dragPoint;
  }

  public endAt(dragPoint: DragPoint | null) {
    if (dragPoint) this.moveTo(dragPoint);

    if (this.isSetToDeleteMode) {
      if (this.draggedVector) {
        const index = this.path.indexOf(this.draggedVector);
        if (index >= 0) {
          this.path.splice(index, 1);
        }
      }
    } else {
      const pathLength = this.path.length;
      if (
        pathLength > 1 &&
        this.path[pathLength - 1].equals(this.path[pathLength - 2])
      ) {
        this.path.pop();
      }
    }

    this.draggedVector = undefined;
    this.isSetToDeleteMode = false;
  }

  public discard = () => {
    this.path = [];
  };

  public submit = () => {
    this.discard();
  };

  public deactivate() {
    this.discard();
  }
}
