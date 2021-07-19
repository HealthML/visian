const GEOMETRY_COUNT = 20;

const preGeneratedGeometries = Array.from(
  { length: GEOMETRY_COUNT },
  // eslint-disable-next-line max-len
  // eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-dynamic-require, global-require
  (_, index) => require(`file-loader!./${index}.txt`).default,
);

export default preGeneratedGeometries;
