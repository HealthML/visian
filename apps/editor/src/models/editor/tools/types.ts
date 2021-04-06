import { Voxel } from "@visian/utils";

export class AnnotationVoxel {
  public static fromVoxelAndValue(voxel: Voxel, value: number) {
    return new this(voxel.x, voxel.y, voxel.z, value);
  }

  constructor(
    public x: number,
    public y: number,
    public z: number,
    public value: number,
  ) {}
}

export interface DragTool {
  startAt: (dragPoint: DragPoint) => void;
  moveTo: (dragPoint: DragPoint) => void;
  endAt: (dragPoint: DragPoint) => void;
}

export interface DragPoint extends Voxel {
  /** Whether the cursor is on the right side of the pixel. */
  right: boolean;
  /** Whether the cursor is on the bottom half of the pixel. */
  bottom: boolean;
}
