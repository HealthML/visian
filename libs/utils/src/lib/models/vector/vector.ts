import { action, makeObservable, observable, toJS } from "mobx";

import { getOrthogonalAxis, ViewType } from "../view-types";

export class OutOfBoundsError extends Error {
  constructor(index: number) {
    super(`Index ${index} is out of bounds.`);
    this.name = "OutOfBoundsError";
  }
}

export interface GenericVector {
  size: number;
  x: number;
  y: number;
  z: number;
  w: number;
  width: number;
  height: number;

  setComponent(index: number | "x" | "y" | "z" | "w", value: number): this;
  getComponent(index: number): number;
  set(...args: number[]): this;
  setScalar(scalar: number): this;
  copy(v: GenericVector): this;
  add(v: GenericVector): this;
  addVectors(a: GenericVector, b: GenericVector): this;
  addScaledVector(vector: GenericVector, scale: number): this;
  addScalar(scalar: number): this;
  sub(v: GenericVector): this;
  subVectors(a: GenericVector, b: GenericVector): this;
  multiply(vector: GenericVector): this;
  multiplyScalar(s: number): this;
  divide(vector: GenericVector): this;
  divideScalar(s: number): this;
  negate(): this;
  dot(v: GenericVector): number;
  lengthSq(): number;
  length(): number;
  sum(): number;
  product(): number;
  normalize(): this;
  distanceTo?(v: Vector): number;
  distanceToSquared?(v: Vector): number;
  setLength(l: number): this;
  lerp(v: GenericVector, alpha: number): this;
  map(mapper: (value: number, index: number) => number): this;
  round(): this;
  floor(): this;
  ceil(): this;
  equals(v: GenericVector): boolean;
  clone(): GenericVector;
  fromArray(array: number[]): this;
  toArray(): number[];
  toString(): string;
  toJSON(): number[];
  getFromView(viewType: ViewType): number;
  setFromView(viewType: ViewType): this;
}

/** An observable vector of generic, fixed size. */
export class Vector implements GenericVector {
  public static fromArray(array: number[]): Vector {
    return new this(array);
  }

  public static fromObject(
    object: { x: number; y?: number; z?: number; w?: number },
    isObservable = true,
  ) {
    let size = 1;
    ["y", "z", "w"].forEach((axis) => {
      const value = object[axis as "y" | "z" | "w"];
      if (value !== undefined) {
        size++;
      } else {
        return new this(size, isObservable).setFromObject(object);
      }
    });
    return new this(size, isObservable).setFromObject(object);
  }

  /** The number of components in this vector. */
  public readonly size: number;

  protected data: number[];

  constructor(
    sizeOrArray: number | number[] = 3,
    public readonly isObservable = true,
  ) {
    if (Array.isArray(sizeOrArray)) {
      this.data = sizeOrArray;
      this.size = sizeOrArray.length;
    } else {
      this.data = new Array(sizeOrArray).fill(0);
      this.size = sizeOrArray;
    }

    if (isObservable) {
      makeObservable<this, "data">(this, {
        data: observable,

        setFromObject: action,
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
        multiply: action,
        multiplyScalar: action,
        divide: action,
        divideScalar: action,
        negate: action,
        normalize: action,
        setLength: action,
        lerp: action,
        map: action,
        setFromView: action,
      });
    }
  }

  public setFromObject(object: {
    x: number;
    y?: number;
    z?: number;
    w?: number;
  }) {
    const array = [object.x];
    ["y", "z", "w"].forEach((axis) => {
      const value = object[axis as "y" | "z" | "w"];
      if (value !== undefined) {
        array.push(value);
      } else {
        return this.set(...array);
      }
    });
    return this.set(...array);
  }

  public setComponent(index: number | "x" | "y" | "z" | "w", value: number) {
    let i = index;
    if (typeof i === "string") {
      i = ["x", "y", "z", "w"].indexOf(i);
    }
    if (process.env.NODE_ENV !== "production" && this.size <= i) {
      throw new OutOfBoundsError(i);
    }
    this.data[i] = value;
    return this;
  }

  public getComponent(index: number) {
    if (process.env.NODE_ENV !== "production" && this.size <= index) {
      throw new OutOfBoundsError(index);
    }
    return this.data[index];
  }

  public get x() {
    return this.getComponent(0);
  }
  public set x(x: number) {
    this.setComponent(0, x);
  }

  public get y() {
    return this.getComponent(1);
  }
  public set y(y: number) {
    this.setComponent(1, y);
  }

  public get z() {
    return this.getComponent(2);
  }
  public set z(z: number) {
    this.setComponent(2, z);
  }
  /** Alias for `z`. */
  public get width() {
    return this.getComponent(2);
  }
  /** Alias for `z`. */
  public set width(width: number) {
    this.setComponent(2, width);
  }

  public get w() {
    return this.getComponent(3);
  }
  public set w(w: number) {
    this.setComponent(3, w);
  }
  /** Alias for `w`. */
  public get height() {
    return this.getComponent(3);
  }
  /** Alias for `w`. */
  public set height(height: number) {
    this.setComponent(3, height);
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
    for (let i = 0; i < size; i++) {
      this.data[i] = vector.getComponent(i);
    }
    return this;
  }

  public add(vector: GenericVector) {
    const size = Math.min(this.size, vector.size);
    for (let i = 0; i < size; i++) {
      this.data[i] += vector.getComponent(i);
    }
    return this;
  }

  public addVectors(vectorA: GenericVector, vectorB: GenericVector) {
    const size = Math.min(this.size, vectorA.size, vectorB.size);
    for (let i = 0; i < size; i++) {
      this.data[i] = vectorA.getComponent(i) + vectorB.getComponent(i);
    }
    return this;
  }

  public addScaledVector(vector: GenericVector, scale: number) {
    const size = Math.min(this.size, vector.size);
    for (let i = 0; i < size; i++) {
      this.data[i] += vector.getComponent(i) * scale;
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
    for (let i = 0; i < size; i++) {
      this.data[i] -= vector.getComponent(i);
    }
    return this;
  }

  public subVectors(vectorA: GenericVector, vectorB: GenericVector) {
    const size = Math.min(this.size, vectorA.size, vectorB.size);
    for (let i = 0; i < size; i++) {
      this.data[i] = vectorA.getComponent(i) - vectorB.getComponent(i);
    }
    return this;
  }

  public multiply(vector: GenericVector) {
    const size = Math.min(this.size, vector.size);
    for (let i = 0; i < size; i++) {
      this.data[i] *= vector.getComponent(i);
    }
    return this;
  }

  public multiplyScalar(scalar: number) {
    for (let i = 0; i < this.size; i++) {
      this.data[i] *= scalar;
    }
    return this;
  }

  public divide(vector: GenericVector) {
    const size = Math.min(this.size, vector.size);
    for (let i = 0; i < size; i++) {
      this.data[i] /= vector.getComponent(i);
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
    for (let i = 0; i < size; i++) {
      result += this.data[i] * vector.getComponent(i);
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

  /** Returns the sum of all components. */
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
    for (let i = 0; i < size; i++) {
      result +=
        (this.data[i] - vector.getComponent(i)) *
        (this.data[i] - vector.getComponent(i));
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
    for (let i = 0; i < size; i++) {
      this.data[i] =
        alpha * vector.getComponent(i) + (1 - alpha) * this.data[i];
    }
    return this;
  }

  public map(mapper: (value: number, index: number) => number) {
    this.data = this.data.map(mapper);
    return this;
  }

  public round() {
    return this.map(Math.round);
  }

  public floor() {
    return this.map(Math.floor);
  }

  public ceil() {
    return this.map(Math.ceil);
  }

  public equals(vector: GenericVector) {
    if (vector.size !== this.size) return false;
    return !~this.data.findIndex(
      (value, index) => vector.getComponent(index) !== value,
    );
  }

  public clone(isObservable = true): Vector {
    return new Vector(this.toArray(), isObservable);
  }

  public fromArray(array: number[]) {
    const size = Math.min(this.size, array.length);
    for (let i = 0; i < size; i++) {
      this.data[i] = array[i];
    }
    return this;
  }

  public toArray() {
    return [...this.data];
  }

  public toString() {
    return `${this.data.join(",")}`;
  }

  public toJSON() {
    return toJS(this.data);
  }

  // Special extensions
  public getFromView(viewType: ViewType) {
    return this[getOrthogonalAxis(viewType)];
  }

  public setFromView(viewType: ViewType, value = 0) {
    this[getOrthogonalAxis(viewType)] = value;
    return this;
  }
}
