import { promiseAllInBatches } from "./batch";

describe("promiseAllInBatches", () => {
  const asyncTask = (item: number) =>
    new Promise((resolve) => {
      setTimeout(() => resolve(item * 2), 10);
    });
  const items = [1, 2, 3, 4, 5];

  test("should process all items with a batchSize of 1", async () => {
    const batchSize = 1;
    const expectedResult = [2, 4, 6, 8, 10];
    const result = await promiseAllInBatches(asyncTask, items, batchSize);

    expect(result).toEqual(expectedResult);
  });

  test("should process all items with a batchSize of 2", async () => {
    const batchSize = 2;
    const expectedResult = [2, 4, 6, 8, 10];
    const result = await promiseAllInBatches(asyncTask, items, batchSize);

    expect(result).toEqual(expectedResult);
  });

  test("should process all items with a batchSize equal to the number of items", async () => {
    const batchSize = items.length;
    const expectedResult = [2, 4, 6, 8, 10];
    const result = await promiseAllInBatches(asyncTask, items, batchSize);

    expect(result).toEqual(expectedResult);
  });

  test("should return an empty array when given an empty array of items", async () => {
    const batchSize = 2;
    const expectedResult: number[] = [];
    const result = await promiseAllInBatches(asyncTask, [], batchSize);

    expect(result).toEqual(expectedResult);
  });

  test("should throw an error when task throws an error", async () => {
    const failingTask = () => Promise.reject(new Error("Failed task"));
    const batchSize = 2;

    await expect(
      promiseAllInBatches(failingTask, items, batchSize),
    ).rejects.toThrow("Failed task");
  });
});
