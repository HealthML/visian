import {
  getOrthogonalAxis,
  getPlaneAxes,
  Image,
  Vector,
  VoxelWithValue,
} from "@visian/utils";
import { Editor } from "../../../models";

import { Brush } from "./brush";

export class SmartBrush extends Brush {
  /**
   * Because we can't compare equality of Vector objects directly we
   * use a sting representation of them.
   */
  private currentStroke: Set<string> = new Set<string>();

  /**
   * Used to track which voxels were drawn by the user in the stroke.
   * Used as seeds for region growing.
   */
  private drawnVoxels: Vector[] = [];

  private minValue = Infinity;
  private maxValue = -Infinity;

  constructor(editor: Editor, value = 255, undoable = true) {
    super(editor, value, undoable);
  }

  protected writeVoxels(voxels: VoxelWithValue[]) {
    super.writeVoxels(voxels);
    voxels.forEach((voxelWithValue) => {
      const voxel = Vector.fromObject(voxelWithValue, false);
      this.currentStroke.add(voxel.toString());
      this.drawnVoxels.push(voxel);
    });
  }

  protected finishStroke(
    isDeleteOperation: boolean | undefined,
    annotation = this.editor.annotation,
    viewType = this.editor.viewSettings.mainViewType,
  ) {
    this.doRegionGrowing();

    this.currentStroke.clear();
    this.drawnVoxels = [];

    super.finishStroke(isDeleteOperation, annotation, viewType);
  }

  private doRegionGrowing(image = this.editor.image) {
    if (!image) return;

    this.minValue = Infinity;
    this.maxValue = -Infinity;
    this.drawnVoxels.forEach((voxel) => {
      const scanValue = image.getVoxelData(voxel);
      if (scanValue < this.minValue) this.minValue = scanValue;
      if (scanValue > this.maxValue) this.maxValue = scanValue;
    });

    const seedThreshold = this.editor.tools.smartBrushSeedThreshold;
    const neighborThreshold = this.editor.tools.smartBrushNeighborThreshold;

    this.minValue -= seedThreshold;
    this.maxValue += seedThreshold;

    const stack = [];
    const voxelsToDraw: Vector[] = [];
    stack.push(...this.drawnVoxels);

    while (stack.length) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const voxel = stack.pop()!;
      const scanAtCoordinate = image.getVoxelData(voxel);

      this.neighborsOf(voxel, image).forEach((neighbor) => {
        if (!this.currentStroke.has(neighbor.toString())) {
          const scanAtNeighbor = image.getVoxelData(neighbor);
          if (
            Math.abs(scanAtCoordinate - scanAtNeighbor) < neighborThreshold &&
            scanAtNeighbor >= this.minValue &&
            scanAtNeighbor <= this.maxValue
          ) {
            voxelsToDraw.push(neighbor);
            this.currentStroke.add(neighbor.toString());
            stack.push(neighbor);
          }
        }
      });
    }

    const grownVoxels: VoxelWithValue[] = [];
    voxelsToDraw.forEach((voxel) => {
      const { x, y, z } = voxel;
      grownVoxels.push({ x, y, z, value: this.value });
    });
    super.writeVoxels(grownVoxels);
  }

  private neighborsOf(voxel: Vector, image: Image) {
    const [x, y] = getPlaneAxes(this.editor.viewSettings.mainViewType);
    const z = getOrthogonalAxis(this.editor.viewSettings.mainViewType);

    const neighbors = [
      Vector.fromObject(
        {
          [x]: voxel[x],
          [y]: voxel[y] - 1,
          [z]: voxel[z],
        } as { x: number; y: number; z: number },
        false,
      ),
      Vector.fromObject(
        {
          [x]: voxel[x],
          [y]: voxel[y] + 1,
          [z]: voxel[z],
        } as { x: number; y: number; z: number },
        false,
      ),
      Vector.fromObject(
        {
          [x]: voxel[x] - 1,
          [y]: voxel[y],
          [z]: voxel[z],
        } as { x: number; y: number; z: number },
        false,
      ),
      Vector.fromObject(
        {
          [x]: voxel[x] - 1,
          [y]: voxel[y] - 1,
          [z]: voxel[z],
        } as { x: number; y: number; z: number },
        false,
      ),
      Vector.fromObject(
        {
          [x]: voxel[x] - 1,
          [y]: voxel[y] + 1,
          [z]: voxel[z],
        } as { x: number; y: number; z: number },
        false,
      ),
      Vector.fromObject(
        {
          [x]: voxel[x] + 1,
          [y]: voxel[y],
          [z]: voxel[z],
        } as { x: number; y: number; z: number },
        false,
      ),
      Vector.fromObject(
        {
          [x]: voxel[x] + 1,
          [y]: voxel[y] - 1,
          [z]: voxel[z],
        } as { x: number; y: number; z: number },
        false,
      ),
      Vector.fromObject(
        {
          [x]: voxel[x] + 1,
          [y]: voxel[y] + 1,
          [z]: voxel[z],
        } as { x: number; y: number; z: number },
        false,
      ),
    ];

    // Prevent neighbors that are outside of the image volume.
    return neighbors.filter(
      (neighbor) =>
        neighbor.x >= 0 &&
        neighbor.y >= 0 &&
        neighbor.z >= 0 &&
        neighbor.x < image.voxelCount.x &&
        neighbor.y < image.voxelCount.y &&
        neighbor.z < image.voxelCount.z,
    );
  }
}
