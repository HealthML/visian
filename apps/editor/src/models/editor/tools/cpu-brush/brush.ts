// DEPRECATED

import { DragPoint, IDocument } from "@visian/ui-shared";
import {
  calculateCircle,
  calculateLine,
  getOrthogonalAxis,
  getPlaneAxes,
  Pixel,
  Vector,
  VoxelWithValue,
} from "@visian/utils";
import { ToolConfig } from "../tool";

import { VoxelWriter } from "./voxel-writer";

export class Brush<N extends string> extends VoxelWriter<N> {
  private dragPoints?: DragPoint[];

  private filledCircleCache?: {
    radius: number;
    circle: Pixel[];
  };

  private circleBorderCache?: {
    radius: number;
    circle: Pixel[];
  };

  constructor(
    config: ToolConfig<N>,
    document: IDocument,
    protected value = 255,
    undoable = true,
  ) {
    super(config, document, undoable);
  }

  public startAt = (dragPoint: DragPoint) => {
    this.dragPoints = [dragPoint];
    this.drawCircleAround(dragPoint);
  };

  public moveTo = (dragPoint: DragPoint) => {
    if (this.dragPoints && this.dragPoints.length) {
      this.dragPoints.push(dragPoint);
      this.drawStroke(
        this.dragPoints[this.dragPoints.length - 2],
        this.dragPoints[this.dragPoints.length - 1],
      );
    }
  };

  public endAt = (dragPoint: DragPoint | null) => {
    if (dragPoint) this.moveTo(dragPoint);
    this.finishStroke(!this.value);
    this.dragPoints = undefined;
  };

  public drawCircleAround(target: DragPoint, fill = true) {
    const voxels = this.getCircleVoxels(target, fill);
    this.writeVoxels(voxels);
  }

  /**
   * Returns pixels of a circle around the @param target. Uses the circle chache
   * if present and the radius is correct. Triggers circle cache calculation
   * otherwise.
   *
   * @param target The center of the circle to draw.
   * @param fill Determines if the circle should be filled or only
   * a two pixel thick border. Default is true.
   */
  private getCircleVoxels(
    target: DragPoint,
    fill = true,
    viewType = this.document.viewport2D.mainViewType,
  ) {
    let circlePixels;
    const radius = this.document.tools.brushSize;

    if (fill) {
      if (!this.filledCircleCache || this.filledCircleCache.radius !== radius) {
        this.createCircleCache(fill);
      }
      circlePixels = this.filledCircleCache?.circle;
    } else {
      if (!this.circleBorderCache || this.circleBorderCache.radius !== radius) {
        this.createCircleCache(fill);
      }
      circlePixels = this.circleBorderCache?.circle;
    }

    const orthogonalAxis = getOrthogonalAxis(viewType);
    const [widthAxis, heightAxis] = getPlaneAxes(viewType);

    const pixelOffsetX = radius === 0.5 && target.right ? -1 : 0;
    const pixelOffsetY = radius === 0.5 && target.bottom ? -1 : 0;

    const voxels: VoxelWithValue[] = [];

    const coordinates = new Vector(3, false);
    circlePixels?.forEach((pixel) => {
      coordinates[orthogonalAxis] = target[orthogonalAxis];
      coordinates[widthAxis] = pixel.x + target[widthAxis] + pixelOffsetX;
      coordinates[heightAxis] = pixel.y + target[heightAxis] + pixelOffsetY;

      const { x, y, z } = coordinates;
      voxels.push({ x, y, z, value: this.value });
    });

    return voxels;
  }

  private createCircleCache(fill: boolean) {
    const circle = calculateCircle(this.document.tools.brushSize, fill);
    if (fill) {
      this.filledCircleCache = {
        circle,
        radius: this.document.tools.brushSize,
      };
    } else {
      this.circleBorderCache = {
        circle,
        radius: this.document.tools.brushSize,
      };
    }
  }

  /**
   * Draws a circle around every pixel of the line fom start to end to make it thick.
   * Optimizes to only draw the border of the circles to lessen double drawing.
   *
   * Does not draw a circle around the start point.
   * Does draw a circle around the end point.
   *
   * @param start The start point of the line.
   * @param end The end point of the line.
   */
  private drawStroke(start: DragPoint, end: DragPoint) {
    const orthogonalAxis = getOrthogonalAxis(
      this.document.viewport2D.mainViewType,
    );
    const [widthAxis, heightAxis] = getPlaneAxes(
      this.document.viewport2D.mainViewType,
    );
    const x1 = start[widthAxis];
    const y1 = start[heightAxis];
    const x2 = end[widthAxis];
    const y2 = end[heightAxis];

    const linePixels = calculateLine(x1, y1, x2, y2);
    const voxels: VoxelWithValue[] = [];
    linePixels.forEach(({ x, y }) => {
      const circleTarget = {
        x: 0,
        y: 0,
        z: 0,
        right: end.right,
        bottom: end.bottom,
      };

      circleTarget[orthogonalAxis] = start[orthogonalAxis];
      circleTarget[widthAxis] = x;
      circleTarget[heightAxis] = y;

      voxels.push(...this.getCircleVoxels(circleTarget, false));
    });
    this.writeVoxels(voxels);
  }
}
