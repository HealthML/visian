import { action, computed, makeObservable, observable } from "mobx";

import { getOrthogonalAxis, ViewType } from "../../rendering";

export class Voxel {
  public x: number;
  public y: number;
  public z: number;

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;

    makeObservable(this, {
      x: observable,
      y: observable,
      z: observable,
      array: computed,
      set: action,
      setX: action,
      setY: action,
      setZ: action,
      setComponent: action,
      setFromView: action,
    });
  }

  public get array() {
    return [this.x, this.y, this.z];
  }

  public set(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public setX(x = 0) {
    this.x = x;
  }

  public setY(y = 0) {
    this.y = y;
  }

  public setZ(z = 0) {
    this.z = z;
  }

  public setComponent(component: "x" | "y" | "z", value = 0) {
    this[component] = value;
  }

  public getFromView(viewType: ViewType) {
    return this[getOrthogonalAxis(viewType)];
  }

  public setFromView(viewType: ViewType, value = 0) {
    this[getOrthogonalAxis(viewType)] = value;
  }
}
