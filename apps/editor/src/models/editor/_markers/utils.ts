/** Combines adjacent values into `[min, max] intervals.` */
export const condenseValues = (sortedArray: number[]) => {
  let lastValue: number | undefined;
  let currentRange: [number, number] | undefined;

  const result = [];
  sortedArray.forEach((value) => {
    if (lastValue !== undefined) {
      if (lastValue >= value - 1) {
        if (currentRange) {
          currentRange[1] = value;
        } else {
          currentRange = [lastValue, value];
        }
      } else if (currentRange) {
        result.push(currentRange);
        currentRange = undefined;
      } else {
        result.push(lastValue);
      }
    }

    lastValue = value;
  });

  if (currentRange) {
    result.push(currentRange);
  } else if (lastValue !== undefined) {
    result.push(sortedArray[sortedArray.length - 1]);
  }

  return result;
};
