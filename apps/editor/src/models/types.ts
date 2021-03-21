export interface ISerializable<T> {
  /** Returns a snapshot.*/
  toJSON(): T;

  /** Restores the state captures in a snapshot. */
  applySnapshot(snapshot: T): Promise<void>;
}

export interface StoreContext {
  persistImmediately(): void;
  setIsDirty(): void;
}

export interface Snapshot {
  [key: string]: unknown;
}
