import { Image, ViewType } from "@visian/utils";
import { action, computed, makeObservable, observable, reaction } from "mobx";
import { RpcProvider } from "worker-rpc";

import { getNonEmptySlicesArgs, getNonEmptySlicesReturn } from "./types";
import { condenseValues } from "./utils";

// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from "worker-loader!./markers.worker";

import type { StoreContext } from "../../types";
import type { Editor } from "../editor";
const worker = new Worker(),
  rpcProvider = new RpcProvider(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (message, transfer) => worker.postMessage(message, transfer as any),
  );
worker.onmessage = (event) => rpcProvider.dispatch(event.data);

export class EditorMarkers {
  public annotatedSlices: boolean[][] = [];

  constructor(protected editor: Editor, protected context: StoreContext) {
    this.reset();

    makeObservable(this, {
      annotatedSlices: observable,

      markers: computed,

      inferAnnotatedSlices: action,
      inferAnnotatedSlice: action,
      reset: action,
    });

    reaction(
      () => this.editor.annotation,
      () => {
        this.inferAnnotatedSlices();
      },
    );

    reaction(
      () => this.editor.viewSettings.mainViewType,
      () => {
        this.inferAnnotatedSlices();
      },
    );
  }

  public get markers(): (number | [number, number])[] {
    const annotatedSlices: number[] = [];
    this.annotatedSlices[this.editor.viewSettings.mainViewType].forEach(
      (isAnnotated, slice) => {
        if (isAnnotated) annotatedSlices.push(slice);
      },
    );

    return condenseValues(annotatedSlices);
  }

  public inferAnnotatedSlices(
    image: Image | undefined = this.editor.annotation,
  ) {
    if (!image) return this.reset();
    rpcProvider
      .rpc<getNonEmptySlicesArgs, getNonEmptySlicesReturn>(
        "getNonEmptySlices",
        {
          atlas: image.getAtlas(),
          voxelCount: image.voxelCount.toArray(),
          voxelComponents: image.voxelComponents,
        },
      )
      .then(
        action((result: boolean[][]) => {
          this.annotatedSlices = result;
        }),
      );
  }

  public inferAnnotatedSlice(
    image: Image | undefined,
    slice: number,
    viewType: ViewType = this.editor.viewSettings.mainViewType,
  ) {
    if (!image) return this.reset();
    if (this.annotatedSlices[viewType].length <= slice) return;
    this.annotatedSlices[viewType][slice] = !image.isSliceEmpty(
      slice,
      viewType,
    );
  }

  public reset() {
    this.annotatedSlices = [[], [], []];
  }
}
