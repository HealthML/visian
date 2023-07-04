import { action, makeObservable, observable, toJS } from "mobx";

import { ISerializable } from "../types";

export interface LimitedStackSnapshot<T> {
  buffer: T[];
  currentItem: number;
}

export class LimitedStack<T> implements ISerializable<LimitedStackSnapshot<T>> {
  protected buffer: T[] = [];

  /**
   * The index of the current item in the stack.
   * `-1` means the stack is empty.
   */
  protected currentItem = -1;

  constructor(
    /**
     * The maximum capacity of the stack.
     * This is not included in the snapshot.
     */
    protected capacity: number,
    isObservable = true,
  ) {
    if (isObservable) {
      makeObservable<this, "buffer" | "currentItem">(this, {
        buffer: observable,
        currentItem: observable,

        navigateBackward: action,
        navigateForward: action,
        push: action,
        clear: action,
      });
    }
  }

  public getCurrent(): T | undefined {
    return this.buffer[this.currentItem];
  }

  /** Pops an item off of the stack. */
  public navigateBackward(): T | undefined {
    this.currentItem = Math.max(this.currentItem - 1, -1);
    return this.buffer[this.currentItem];
  }

  public navigateForward(): T | undefined {
    this.currentItem = Math.min(this.currentItem + 1, this.buffer.length - 1);
    return this.buffer[this.currentItem];
  }

  public canNavigateBackward() {
    return this.currentItem > -1;
  }

  public canNavigateForward() {
    return this.currentItem < this.buffer.length - 1;
  }

  public push(item: T): T {
    this.buffer = this.buffer.slice(0, this.currentItem + 1);
    this.buffer.push(item);
    this.currentItem++;
    if (this.buffer.length > this.capacity) {
      this.buffer.shift();
      this.currentItem--;
    }
    return item;
  }

  public clear() {
    this.buffer = [];
    this.currentItem = -1;
    return this;
  }

  public toJSON() {
    return { buffer: toJS(this.buffer), currentItem: this.currentItem };
  }

  public async applySnapshot(snapshot: LimitedStackSnapshot<T>) {
    this.buffer = snapshot.buffer;
    this.currentItem = Math.max(
      -1,
      Math.min(
        snapshot.currentItem,
        this.capacity - 1,
        snapshot.buffer.length - 1,
      ),
    );
  }
}

export interface CommandStackSnapshot<T> {
  buffer: T[];
  currentItem: number;
  saveItem: number;
}

export class CommandStack<T> extends LimitedStack<T> {
  protected saveItem = -1;

  constructor(capacity: number, isObservable = true) {
    super(capacity, isObservable);
    makeObservable<this, "saveItem">(this, {
      saveItem: observable,

      save: action,
    });
  }

  public push(item: T): T {
    const pushedItem = super.push(item);

    if (
      this.currentItem < this.saveItem ||
      (this.saveItem === this.currentItem &&
        this.capacity !== this.buffer.length)
    ) {
      this.saveItem = -2;
    }

    return pushedItem;
  }

  public clear() {
    super.clear();
    this.saveItem = -2;
    return this;
  }

  public toJSON() {
    return { ...super.toJSON(), saveItem: this.saveItem };
  }

  public async applySnapshot(snapshot: CommandStackSnapshot<T>) {
    await super.applySnapshot(snapshot);
    this.saveItem = Math.max(
      -2,
      Math.min(
        snapshot.saveItem,
        this.capacity - 1,
        snapshot.buffer.length - 1,
      ),
    );
  }

  public save() {
    this.saveItem = this.currentItem;
  }

  public isDirty() {
    return this.saveItem !== this.currentItem;
  }

  public map(mapFunction: (item: T) => T) {
    this.buffer = this.buffer.map(mapFunction);
  }
}
