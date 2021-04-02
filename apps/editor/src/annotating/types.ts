export class AnnotationVoxel {
  public static fromVoxelAndValue(
    voxel: { x: number; y: number; z: number },
    value: number,
  ) {
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

export interface DragPoint {
  x: number;
  y: number;
  z: number;
  /** Whether the cursor is on the left side of the pixel. */
  left: boolean;
  /** Whether the cursor is on the bottom half of the pixel. */
  bottom: boolean;
}
