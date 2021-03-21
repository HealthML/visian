export interface ISerializable<T> {
  /** Returns a snapshot.*/
  toJSON(): T;

  /** Applies a snapshot. */
  rehydrate(snapshot: T): Promise<void>;
}
