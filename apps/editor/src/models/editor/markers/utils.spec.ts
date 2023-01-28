import { condenseValues } from "./utils";

describe("condenseValues", () => {
  it("should return an empty array", () => {
    expect(condenseValues([])).toEqual([]);
  });

  it("should not combine non-adjacent values", () => {
    expect(condenseValues([0, 2, 4, 6, 8, 2120, 378972])).toEqual([
      0, 2, 4, 6, 8, 2120, 378972,
    ]);
  });

  it("should combine adjacent values", () => {
    expect(condenseValues([0, 1, 2, 8, 20, 1897, 1898])).toEqual([
      [0, 2],
      8,
      20,
      [1897, 1898],
    ]);

    expect(condenseValues([0, 2, 3, 8, 20, 1897])).toEqual([
      0,
      [2, 3],
      8,
      20,
      1897,
    ]);
  });
});
