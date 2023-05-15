/**
 * Same as Promise.all(items.map(item => task(item))), but it waits for
 * the first {batchSize} promises to finish before starting the next batch.
 *
 * Source: https://stackoverflow.com/a/64543086/7198908
 *
 * @template ItemType
 * @template ResultType
 * @param {function(ItemType): ResultType} task The task to run for each item.
 * @param {ItemType[]} items Arguments to pass to the task for each call.
 * @param {int} batchSize
 * @returns {Promise<ResultType[]>}
 */
export async function promiseAllInBatches<ItemType, ResultType>(
  task: (item: ItemType) => Promise<ResultType>,
  items: ItemType[],
  batchSize: number,
) {
  let position = 0;
  let results: ResultType[] = [];
  while (position < items.length) {
    const itemsForBatch = items.slice(position, position + batchSize);
    results = [
      ...results,
      // eslint-disable-next-line no-await-in-loop
      ...(await Promise.all(itemsForBatch.map((item) => task(item)))),
    ];
    position += batchSize;
  }
  return results;
}
