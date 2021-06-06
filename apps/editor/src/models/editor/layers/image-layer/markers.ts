import { RpcProvider } from "worker-rpc";

// eslint-disable-next-line import/no-unresolved,import/no-webpack-loader-syntax
import MarkerWorker from "worker-loader!./markers.worker";

const markerWorker = new MarkerWorker();
export const markerRPCProvider = new RpcProvider(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (message, transfer) => markerWorker.postMessage(message, transfer as any),
);
markerWorker.onmessage = (event) => markerRPCProvider.dispatch(event.data);
