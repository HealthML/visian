export class LimitedStack<T> {
  protected buffer: T[] = [];
  protected currentItem = -1;

  constructor(protected capacity: number) {}

  public getCurrent(): T {
    return this.buffer[this.currentItem];
  }

  public navigateBackward(): T {
    this.currentItem = Math.max(this.currentItem - 1, -1);
    return this.buffer[this.currentItem];
  }

  public navigateForward(): T {
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
}

export default LimitedStack;
