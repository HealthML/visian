import { getOrthogonalAxis, getPlaneAxes, Vector } from "@visian/utils";

import { Editor } from "../../models";
import Annotator from "../annotator";
import { AnnotationVoxel, DragPoint, DragTool } from "../types";
import { calculateCircle, calculateLine } from "./rasterization";

export class Brush extends Annotator implements DragTool {
  private dragPoints?: DragPoint[];

  private filledCircleCache?: {
    radius: number;
    circle: { x: number; y: number }[];
  };

  private circleBorderCache?: {
    radius: number;
    circle: { x: number; y: number }[];
  };

  constructor(
    editor: Editor,
    render: () => void,
    private value = 255,
    undoable = true,
  ) {
    super(editor, render, undoable);
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

  public endAt = (dragPoint: DragPoint) => {
    this.moveTo(dragPoint);
    this.finishStroke();
    this.dragPoints = undefined;
  };

  public drawCircleAround(target: DragPoint, fill = true) {
    const circle = this.getCirclePixels(target, fill);
    this.annotate(circle);
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
  private getCirclePixels(target: DragPoint, fill = true) {
    let circlePixels;
    const radius = this.editor.tools.brushSizePixels;

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

    const orthogonalAxis = getOrthogonalAxis(
      this.editor.viewSettings.mainViewType,
    );
    const [widthAxis, heightAxis] = getPlaneAxes(
      this.editor.viewSettings.mainViewType,
    );

    const pixelOffsetX = radius === 0.5 && target.right ? -1 : 0;
    const pixelOffsetY = radius === 0.5 && target.bottom ? -1 : 0;

    const annotations: AnnotationVoxel[] = [];

    const coordinates = new Vector(3, false);
    circlePixels?.forEach((pixel) => {
      coordinates[orthogonalAxis] = target[orthogonalAxis];
      coordinates[widthAxis] = pixel.x + target[widthAxis] + pixelOffsetX;
      coordinates[heightAxis] = pixel.y + target[heightAxis] + pixelOffsetY;
      annotations.push(
        AnnotationVoxel.fromVoxelAndValue(coordinates, this.value),
      );
    });

    return annotations;
  }

  private createCircleCache(fill: boolean) {
    const circle = calculateCircle(this.editor.tools.brushSizePixels, fill);
    if (fill) {
      this.filledCircleCache = {
        circle,
        radius: this.editor.tools.brushSizePixels,
      };
    } else {
      this.circleBorderCache = {
        circle,
        radius: this.editor.tools.brushSizePixels,
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
      this.editor.viewSettings.mainViewType,
    );
    const [widthAxis, heightAxis] = getPlaneAxes(
      this.editor.viewSettings.mainViewType,
    );
    const x1 = start[widthAxis];
    const y1 = start[heightAxis];
    const x2 = end[widthAxis];
    const y2 = end[heightAxis];

    const linePixels = calculateLine(x1, y1, x2, y2);
    const annotations: AnnotationVoxel[] = [];
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

      annotations.push(...this.getCirclePixels(circleTarget, false));
    });
    this.annotate(annotations);
  }
}
