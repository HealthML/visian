import { action, makeObservable, observable, toJS } from "mobx";

import { getOrthogonalAxis, ViewType } from "../../rendering";

import type * as THREE from "three";

export interface GenericVector extends THREE.Vector {
  size: number;

  toArray(): number[];
}

/** An observable vector of generic, fixed size. */
export class Vector implements GenericVector {
  public static fromArray(array: number[]): Vector {
    return new Vector(array.length).fromArray(array);
  }

  protected data: number[];

  constructor(
    /** The number of elements in this vector. */
    public readonly size = 3,
  ) {
    this.data = observable(new Array(size).fill(0));

    makeObservable(this, {
      setComponent: action,
      set: action,
      setScalar: action,
      copy: action,
      add: action,
      addVectors: action,
      addScaledVector: action,
      addScalar: action,
      sub: action,
      subVectors: action,
      multiplyScalar: action,
      divideScalar: action,
      negate: action,
      normalize: action,
      setLength: action,
      lerp: action,
      setFromView: action,
    });
  }

  public get x() {
    return this.data[0];
  }
  public set x(x: number) {
    this.data[0] = x;
  }

  public get y() {
    return this.data[1];
  }
  public set y(y: number) {
    this.data[1] = y;
  }

  public get z() {
    return this.data[2];
  }
  public set z(z: number) {
    this.data[2] = z;
  }
  /** Alias for `z`. */
  public get width() {
    return this.data[2];
  }
  /** Alias for `z`. */
  public set width(width: number) {
    this.data[2] = width;
  }

  public get w() {
    return this.data[3];
  }
  public set w(w: number) {
    this.data[3] = w;
  }
  /** Alias for `w`. */
  public get height() {
    return this.data[3];
  }
  /** Alias for `w`. */
  public set height(height: number) {
    this.data[3] = height;
  }

  public setComponent(index: number, value: number) {
    this.data[index] = value;
    return this;
  }

  public getComponent(index: number) {
    return this.data[index];
  }

  public set(...args: number[]) {
    const size = Math.min(this.size, args.length);
    for (let i = 0; i < size; i++) {
      this.data[i] = args[i];
    }
    return this;
  }

  public setScalar(scalar: number) {
    for (let i = 0; i < this.size; i++) {
      this.data[i] = scalar;
    }
    return this;
  }

  public copy(vector: GenericVector) {
    const size = Math.min(this.size, vector.size);
    const vectorData = vector.toArray();
    for (let i = 0; i < size; i++) {
      this.data[i] = vectorData[i];
    }
    return this;
  }

  public add(vector: GenericVector) {
    const size = Math.min(this.size, vector.size);
    const vectorData = vector.toArray();
    for (let i = 0; i < size; i++) {
      this.data[i] += vectorData[i];
    }
    return this;
  }

  public addVectors(vectorA: GenericVector, vectorB: GenericVector) {
    const size = Math.min(this.size, vectorA.size, vectorB.size);
    const vectorAData = vectorA.toArray();
    const vectorBData = vectorB.toArray();
    for (let i = 0; i < size; i++) {
      this.data[i] = vectorAData[i] + vectorBData[i];
    }
    return this;
  }

  public addScaledVector(vector: GenericVector, scale: number) {
    const size = Math.min(this.size, vector.size);
    const vectorData = vector.toArray();
    for (let i = 0; i < size; i++) {
      this.data[i] += vectorData[i] * scale;
    }
    return this;
  }

  public addScalar(scalar: number) {
    for (let i = 0; i < this.size; i++) {
      this.data[i] += scalar;
    }
    return this;
  }

  public sub(vector: GenericVector) {
    const size = Math.min(this.size, vector.size);
    const vectorData = vector.toArray();
    for (let i = 0; i < size; i++) {
      this.data[i] -= vectorData[i];
    }
    return this;
  }

  public subVectors(vectorA: GenericVector, vectorB: GenericVector) {
    const size = Math.min(this.size, vectorA.size, vectorB.size);
    const vectorAData = vectorA.toArray();
    const vectorBData = vectorB.toArray();
    for (let i = 0; i < size; i++) {
      this.data[i] = vectorAData[i] - vectorBData[i];
    }
    return this;
  }

  public multiplyScalar(scalar: number) {
    for (let i = 0; i < this.size; i++) {
      this.data[i] *= scalar;
    }
    return this;
  }

  public divideScalar(scalar: number) {
    for (let i = 0; i < this.size; i++) {
      this.data[i] /= scalar;
    }
    return this;
  }

  public negate() {
    for (let i = 0; i < this.size; i++) {
      this.data[i] *= -1;
    }
    return this;
  }

  public dot(vector: GenericVector) {
    let result = 0;
    const size = Math.min(this.size, vector.size);
    const vectorData = vector.toArray();
    for (let i = 0; i < size; i++) {
      result += this.data[i] * vectorData[i];
    }
    return result;
  }

  public lengthSq() {
    let result = 0;
    for (let i = 0; i < this.size; i++) {
      result += this.data[i] * this.data[i];
    }
    return result;
  }

  public length() {
    return Math.sqrt(this.lengthSq());
  }

  /** Returns the sum of all components.*/
  public sum() {
    return this.data.reduce((sum, value) => sum + value);
  }

  /** Returns the product of all components. */
  public product() {
    return this.data.reduce((sum, value) => sum * value);
  }

  public normalize() {
    return this.divideScalar(this.length());
  }

  public distanceToSquared(vector: GenericVector) {
    let result = 0;
    const size = Math.min(this.size, vector.size);
    const vectorData = vector.toArray();
    for (let i = 0; i < size; i++) {
      result += (this.data[i] - vectorData[i]) * (this.data[i] - vectorData[i]);
    }
    return result;
  }

  public distanceTo(vector: GenericVector) {
    return Math.sqrt(this.distanceToSquared(vector));
  }

  public setLength(length: number) {
    return this.multiplyScalar(length / this.length());
  }

  public lerp(vector: GenericVector, alpha: number) {
    const size = Math.min(this.size, vector.size);
    const vectorData = vector.toArray();
    for (let i = 0; i < size; i++) {
      this.data[i] = alpha * vectorData[i] + (1 - alpha) * this.data[i];
    }
    return this;
  }

  public equals(vector: GenericVector) {
    if (vector.size !== this.size) return false;
    const vectorData = vector.toArray();
    return !~this.data.findIndex((value, index) => vectorData[index] !== value);
  }

  public clone(): Vector {
    return new Vector(this.size).copy(this);
  }

  public fromArray(array: number[]) {
    const size = Math.min(this.size, array.length);
    for (let i = 0; i < size; i++) {
      this.data[i] = array[i];
    }
    return this;
  }

  public toArray() {
    return this.data;
  }

  public toJSON() {
    return toJS(this.data);
  }

  public getFromView(viewType: ViewType) {
    return this[getOrthogonalAxis(viewType)];
  }

  public setFromView(viewType: ViewType, value = 0) {
    this[getOrthogonalAxis(viewType)] = value;
  }
}
