import { action, makeObservable, observable } from "mobx";

export class Pixel {
  public x: number;
  public y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;

    makeObservable(this, {
      x: observable,
      y: observable,
      set: action,
      setX: action,
      setY: action,
    });
  }

  public set(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  public setX(x = 0) {
    this.x = x;
  }

  public setY(y = 0) {
    this.y = y;
  }
}
