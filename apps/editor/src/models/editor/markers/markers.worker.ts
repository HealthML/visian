import { getNonEmptySlices, Vector } from "@visian/utils";
import { RpcProvider } from "worker-rpc";

import type { getNonEmptySlicesArgs, getNonEmptySlicesReturn } from "./types";

const rpcProvider = new RpcProvider((message, transfer) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postMessage(message, transfer as any),
);
onmessage = (event) => rpcProvider.dispatch(event.data);

rpcProvider.registerRpcHandler(
  "getNonEmptySlices",
  ({
    atlas,
    voxelComponents,
    voxelCount,
  }: getNonEmptySlicesArgs): getNonEmptySlicesReturn => {
    return getNonEmptySlices({
      getAtlas: () => atlas,
      voxelComponents,
      voxelCount: new Vector(voxelCount, false),
    });
  },
);
