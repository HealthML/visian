import { getEmptySlices, Vector } from "@visian/utils";
import { RpcProvider } from "worker-rpc";

import type {
  GetEmptySlicesArgs,
  GetEmptySlicesReturn,
  IsSliceEmptyArgs,
  IsSliceEmptyReturn,
} from "./types";

const rpcProvider = new RpcProvider((message, transfer) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postMessage(message, transfer as any),
);
onmessage = (event) => rpcProvider.dispatch(event.data);

rpcProvider.registerRpcHandler(
  "getEmptySlices",
  ({
    atlas,
    voxelComponents,
    voxelCount,
  }: GetEmptySlicesArgs): GetEmptySlicesReturn =>
    getEmptySlices({
      getAtlas: () => atlas,
      voxelComponents,
      voxelCount: new Vector(voxelCount, false),
    }),
);

rpcProvider.registerRpcHandler(
  "isSliceEmpty",
  ({ sliceData }: IsSliceEmptyArgs): IsSliceEmptyReturn =>
    sliceData.every((value) => value === 0),
);

// This noop is required for serialization
rpcProvider.registerRpcHandler("noop", () => {
  // Intentionally left blank
});
