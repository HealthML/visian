export interface ISerializable<T> {
  /** Returns a snapshot. */
  toJSON(): T;

  /**
   * Restores the state captured in a snapshot.
   *
   * @param snapshot The snapshot.
   * The use of a `Partial` value here enables backwards compatibility when
   * new fields are added to the snapshot.
   */
  applySnapshot(snapshot: Partial<T>): Promise<void>;
}

export type VoxelInfoMode = "off" | "on" | "delay";
