import {
  convertDataArrayToAtlas,
  getAtlasGrid,
  getTextureFromAtlas,
  Image,
  Vector,
} from "@visian/utils";
import {
  TrackingLog,
  PointerTrackingEvent,
  ITrackingData,
} from "@visian/ui-shared";
import * as THREE from "three";

export const HEAT_MAP_GRID_SIZE = 10; // mm
export const HEAT_MAP_MAX_EVENT_TIME = 1000; // ms

export class TrackingData implements ITrackingData {
  public texture: THREE.Texture;
  public atlasGrid: Vector;
  public resolution: Vector;

  constructor(
    log: TrackingLog,
    image: Pick<Image, "voxelCount" | "voxelSpacing">,
  ) {
    this.resolution = image.voxelCount
      .clone(true)
      .multiply(image.voxelSpacing)
      .divideScalar(HEAT_MAP_GRID_SIZE)
      .ceil();

    this.atlasGrid = getAtlasGrid(this.resolution).clone(true);

    const data = new Array<number>(this.resolution.product()).fill(0);

    const yOffset = this.resolution.x;
    const zOffset = yOffset * this.resolution.y;

    let lastCoordinates: Vector | undefined;
    let lastTime: number | undefined;

    log.forEach((event) => {
      if (lastCoordinates && lastTime !== undefined) {
        const time = event.at - lastTime;
        lastTime = undefined;

        const index =
          lastCoordinates.x +
          lastCoordinates.y * yOffset +
          lastCoordinates.z * zOffset;
        lastCoordinates = undefined;

        data[index] += Math.min(time, HEAT_MAP_MAX_EVENT_TIME);
      }

      if (event.kind === "POINTER_MOVE") {
        const { voxelX, voxelY, voxelZ } = event as PointerTrackingEvent;

        if (
          voxelX === undefined ||
          voxelY === undefined ||
          voxelZ === undefined
        ) {
          return;
        }

        if (
          voxelX < 0 ||
          voxelX >= image.voxelCount.x ||
          voxelY < 0 ||
          voxelY >= image.voxelCount.y ||
          voxelZ < 0 ||
          voxelZ >= image.voxelCount.z
        ) {
          throw new Error("tracking-data-mismatch-error");
        }
        lastTime = event.at;

        lastCoordinates = new Vector([voxelX, voxelY, voxelZ])
          .divide(image.voxelCount)
          .multiply(this.resolution)
          .floor();
      }
    });

    const atlas = convertDataArrayToAtlas(new Int32Array(data), {
      voxelComponents: 1,
      voxelCount: this.resolution,
    });

    this.texture = getTextureFromAtlas(
      { voxelCount: this.resolution, voxelComponents: 1 },
      atlas,
      THREE.NearestFilter,
    );
  }
}
