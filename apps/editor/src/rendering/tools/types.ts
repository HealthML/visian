import { Pixel, Voxel } from "@visian/utils";

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

export interface Circle extends Pixel {
  radius: number;
  value: number;
}
