import type { Pointer } from "../../types";

const flipSign = (value: number) => (value ? -value : 0);

/** Transform data, stores pointer transform/offset data. */
export class TransformData {
  /** Generates transform data from an array of pointers. */
  public static fromPointers<ID>(pointers: Pointer<ID>[]): TransformData {
    const pointerCount = pointers.length;

    let translateX = 0;
    let translateY = 0;
    let scale = 1;
    let twist = 0;

    // Compute average position (transform origin)
    pointers.forEach(({ detail }) => {
      translateX += detail.clientX;
      translateY += detail.clientY;
      if (detail.scale) scale *= detail.scale;
      if (detail.twist) twist += detail.twist;
    });
    translateX /= pointerCount;
    translateY /= pointerCount;

    return new TransformData(
      // Average x position
      translateX,
      // Average y position
      translateY,
      // Average distance from transform origin
      (pointers.reduce(
        (sum, { detail }) =>
          sum +
          Math.sqrt(
            (detail.clientX - translateX) ** 2 +
              (detail.clientY - translateY) ** 2,
          ),
        0,
      ) / pointerCount || 1) * scale,
      // TODO: Rotation angle of all involved pointers
      twist,
    );
  }

  constructor(
    /** X position/offset in px. */
    public translateX: number = 0,
    /** Y position/offset in px. */
    public translateY: number = 0,
    /** Distance/scale (zoom) as factor. */
    public scale: number = 1,
    /** Angle/rotation offset in degrees. */
    public twist: number = 0,
  ) {
    if (this.scale === 0) this.scale = 1;
  }

  /** Creates a new set of identical transform values. */
  public clone(): TransformData {
    return new TransformData(
      this.translateX,
      this.translateY,
      this.scale,
      this.twist,
    );
  }

  /** Inverts the transform data. */
  public invert(): TransformData {
    this.translateX = flipSign(this.translateX);
    this.translateY = flipSign(this.translateY);
    this.scale = 1 / this.scale;
    this.twist = flipSign(this.twist);
    return this;
  }

  /** Merges another set of transform data additively into this one. */
  public add(otherTransform: TransformData): TransformData {
    this.translateX += otherTransform.translateX;
    this.translateY += otherTransform.translateY;
    this.scale *= otherTransform.scale;
    this.twist += otherTransform.twist;
    return this;
  }

  /** Sets new transform values. */
  public set({
    translateX = this.translateX,
    translateY = this.translateY,
    scale = this.scale,
    twist = this.twist,
  }: Partial<TransformData>): TransformData {
    this.translateX = translateX;
    this.translateY = translateY;
    this.scale = scale || 1;
    this.twist = twist;
    return this;
  }

  /** Merges another set of transform data subtractively into this one. */
  public subtract(otherTransform: TransformData): TransformData {
    this.translateX -= otherTransform.translateX;
    this.translateY -= otherTransform.translateY;
    this.scale /= otherTransform.scale;
    this.twist -= otherTransform.twist;
    return this;
  }

  /**
   * Offsets `translateX`/`translateY` so that the given zoom target
   * (e.g. mouse position) stays fixed in place with respect to the zoom.
   *
   * This eliminates any perceived displacement/shifting resulting from a zoom.
   *
   * @param zoomTarget The point to zoom around (e.g. mouse position).
   * @param actualZoomCenter The point the actual (DOM) scaling originates
   * from (usually top left of the element)
   */
  public counterZoomOffset(
    zoomTarget: TransformData,
    actualZoomCenter?: TransformData,
  ) {
    this.translateX -=
      (zoomTarget.translateX - (actualZoomCenter?.translateX || 0)) *
      (this.scale - 1);
    this.translateY -=
      (zoomTarget.translateY - (actualZoomCenter?.translateY || 0)) *
      (this.scale - 1);
    return this;
  }
}
