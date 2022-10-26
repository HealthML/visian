// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
import VolumeWorker from "worker-loader!./volume.worker";
import { RpcProvider } from "worker-rpc";

// eslint-disable-next-line import/no-unresolved,import/no-webpack-loader-syntax

const volumeWorker = new VolumeWorker();
export const volumeRPCProvider = new RpcProvider(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (message, transfer) => volumeWorker.postMessage(message, transfer as any),
);
volumeWorker.onmessage = (event) => volumeRPCProvider.dispatch(event.data);
