import { Vector } from "./vector";

describe("Vector", () => {
  it("should create a new vector from a size", () => {
    expect(new Vector().toArray()).toEqual([0, 0, 0]);
    expect(new Vector(2).toArray()).toEqual([0, 0]);
  });

  it("should create a new vector from an array", () => {
    expect(new Vector([0, 1, 2]).toArray()).toEqual([0, 1, 2]);
    expect(Vector.fromArray([0, 1, 2]).toArray()).toEqual([0, 1, 2]);
  });

  it("should set a component", () => {
    expect(new Vector(2).setComponent(1, 1).toArray()).toEqual([0, 1]);
  });

  it("should get a component", () => {
    expect(new Vector([0, 1]).getComponent(1)).toEqual(1);
  });

  it("should set multiple components", () => {
    expect(new Vector(3).set(1, 1).toArray()).toEqual([1, 1, 0]);
  });

  it("should set all components to a scalar", () => {
    expect(new Vector(2).setScalar(1).toArray()).toEqual([1, 1]);
  });

  it("should add a vector", () => {
    expect(new Vector([0, 1]).add(new Vector([1, 2, 3])).toArray()).toEqual([
      1,
      3,
    ]);

    expect(new Vector(3).add(new Vector([1, 2])).toArray()).toEqual([1, 2, 0]);
  });

  it("should compute the dot product with a vector", () => {
    expect(new Vector([1, 2, 3]).dot(new Vector([2, 0, 1]))).toBe(5);
  });

  it("should compute the sum", () => {
    expect(new Vector([1, 2, 3]).sum()).toBe(6);
  });

  it("should normalize this vector", () => {
    expect(new Vector([2, 0]).normalize().toArray()).toEqual([1, 0]);
    expect(new Vector([0, 2]).setLength(1).toArray()).toEqual([0, 1]);
  });

  it("should check if this vector is equal to another", () => {
    expect(new Vector([2, 0]).equals(new Vector([2, 0, 0]))).toBe(false);
    expect(new Vector([2, 0]).equals(new Vector([2, 1]))).toBe(false);

    expect(new Vector([2, 0]).equals(new Vector([2, 0]))).toBe(true);
  });
});
