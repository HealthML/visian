import { getArea, getVolume, Vector } from "@visian/utils";
import { RpcProvider } from "worker-rpc";

import type {
  GetAreaArgs,
  GetAreaReturn,
  GetVolumeArgs,
  GetVolumeReturn,
} from "./types";

const rpcProvider = new RpcProvider((message, transfer) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postMessage(message, transfer as any),
);
onmessage = (event) => rpcProvider.dispatch(event.data);

rpcProvider.registerRpcHandler(
  "getVolume",
  ({
    data,
    voxelComponents,
    voxelCount,
    voxelSpacing,
  }: GetVolumeArgs): GetVolumeReturn =>
    getVolume(
      {
        voxelComponents,
        voxelCount: new Vector(voxelCount, false),
        voxelSpacing: new Vector(voxelSpacing, false),
      },
      data,
    ),
);

rpcProvider.registerRpcHandler(
  "getArea",
  ({
    data,
    voxelComponents,
    voxelCount,
    voxelSpacing,
    viewType,
    slice,
  }: GetAreaArgs): GetAreaReturn =>
    getArea(
      {
        voxelComponents,
        voxelCount: new Vector(voxelCount, false),
        voxelSpacing: new Vector(voxelSpacing, false),
      },
      data,
      viewType,
      slice,
    ),
);
