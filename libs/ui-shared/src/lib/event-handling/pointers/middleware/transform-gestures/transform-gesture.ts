import { TransformData } from "./transform-data";

/**
 * Transform gesture, used to compute the offset transformation
 * from the transformation origin to the gesture's target.
 */
export class TransformGesture {
  /** Current gesture target. */
  protected target: TransformData;

  /**
   * Any previous transformation that has been applied to the target this
   * gesture refers to.
   *
   * It is used as an additional offset to add on top of the computed
   * transformation, as well as to counter additional offsets introduced by
   * the change in scale factor.
   */
  protected startTransform: TransformData;

  constructor(
    /** The initial gesture target. */
    protected origin: TransformData = new TransformData(),
    /** Gesture context (to store arbitrary data related to the gesture). */
    public context: { [key: string]: unknown } = {},
  ) {
    this.target = origin.clone();
    this.startTransform = new TransformData();
  }

  /** Returns the gesture's origin. */
  public getOrigin(): TransformData {
    return this.origin;
  }

  /** Returns the gesture's target. */
  public getTarget(): TransformData {
    return this.target;
  }

  /** Returns the transformation delta resulting from the gesture. */
  public getDelta(): TransformData {
    return this.target.clone().subtract(this.origin);
  }

  /**
   * Returns the transformation data resulting from the gesture.
   *
   * This takes into account any additional offset applied through scale
   * changes and offsets the result by the `startTransformation`.
   */
  public getTransformed(): TransformData {
    return this.target
      .clone()
      .subtract(this.origin)
      .counterZoomOffset(this.origin, this.startTransform)
      .add(this.startTransform);
  }

  /**
   * Replaces the origin (initial transformation data),
   * preserves resulting transformation.
   *
   * @param origin The new origin
   */
  public rebase(origin: TransformData): TransformGesture {
    this.origin = origin;
    return this.setTarget(origin);
  }

  /** Updates the gesture's target. */
  public setTarget(currentTarget: Partial<TransformData>): TransformGesture {
    this.target.set(currentTarget);
    return this;
  }

  /**
   * Any previous transformation that has been applied to the target this
   * gesture refers to.
   *
   * It is used as an additional offset to add on top of the computed
   * transformation, as well as to counter additional offsets introduced by
   * the change in scale factor.
   */
  public setStartTransform(offset: Partial<TransformData>): TransformGesture {
    this.startTransform.set(offset);
    return this;
  }
}
