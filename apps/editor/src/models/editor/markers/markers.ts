import { Image, ViewType } from "@visian/utils";
import { action, computed, makeObservable, observable, reaction } from "mobx";
import { RpcProvider } from "worker-rpc";

import {
  getNonEmptySlicesArgs,
  getNonEmptySlicesReturn,
  isSliceEmptyArgs,
  isSliceEmptyReturn,
} from "./types";
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

const emptyMarkerArray: (number | [number, number])[] = [];

/** Handles the editor's slice slider markers. */
export class EditorMarkers {
  public annotatedSlices: boolean[][] = [];

  constructor(protected editor: Editor, protected context: StoreContext) {
    this.reset();

    makeObservable<this, "setAnnotatedSlices">(this, {
      annotatedSlices: observable,

      markers: computed,

      setAnnotatedSlices: action,
      setAnnotatedSlice: action,
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

  protected setAnnotatedSlices = (value: boolean[][]) => {
    this.annotatedSlices = value;
  };

  public get isDisabled() {
    return (
      !this.editor.annotation ||
      this.editor.annotation.dimensionality < 3 ||
      !this.editor.viewSettings.getMaxSlice()
    );
  }

  public get markers(): (number | [number, number])[] {
    if (this.isDisabled) return emptyMarkerArray;

    const annotatedSlices: number[] = [];
    this.annotatedSlices[this.editor.viewSettings.mainViewType].forEach(
      (isAnnotated, slice) => {
        if (isAnnotated) annotatedSlices.push(slice);
      },
    );

    return condenseValues(annotatedSlices);
  }

  public getAnnotatedSlice(
    image: Image | undefined = this.editor.annotation,
    sliceNumber: number,
    viewType: ViewType = this.editor.viewSettings.mainViewType,
  ) {
    if (
      !image ||
      this.isDisabled ||
      this.annotatedSlices[viewType].length <= sliceNumber
    ) {
      return false;
    }

    return this.annotatedSlices[viewType][sliceNumber];
  }

  public setAnnotatedSlice = (
    isAnnotated: boolean,
    image: Image | undefined = this.editor.annotation,
    sliceNumber: number,
    viewType: ViewType = this.editor.viewSettings.mainViewType,
  ) => {
    if (
      !image ||
      this.isDisabled ||
      this.annotatedSlices[viewType].length <= sliceNumber
    ) {
      return;
    }

    this.annotatedSlices[viewType][sliceNumber] = isAnnotated;
  };

  public inferAnnotatedSlices(
    image: Image | undefined = this.editor.annotation,
  ) {
    if (this.isDisabled) return;
    if (!image) return this.reset();

    // TODO: If multiple updates are queued, only the latest one should be executed
    rpcProvider
      .rpc<getNonEmptySlicesArgs, getNonEmptySlicesReturn>(
        "getNonEmptySlices",
        {
          atlas: image.getAtlas(),
          voxelCount: image.voxelCount.toArray(),
          voxelComponents: image.voxelComponents,
        },
      )
      .then(this.setAnnotatedSlices);
  }

  public inferAnnotatedSlice(
    image: Image | undefined,
    sliceNumber: number,
    viewType: ViewType = this.editor.viewSettings.mainViewType,
    isDeleteOperation?: boolean,
  ) {
    if (
      this.isDisabled ||
      this.annotatedSlices[viewType].length <= sliceNumber ||
      // TODO: This can lead to race conditions and should be reworked in the future
      (isDeleteOperation &&
        !this.getAnnotatedSlice(image, sliceNumber, viewType)) ||
      (isDeleteOperation === false &&
        this.getAnnotatedSlice(image, sliceNumber))
    ) {
      return;
    }
    if (!image) return this.reset();

    // TODO: If multiple updates are queued for the same slice, only the latest
    // one should be executed
    rpcProvider
      .rpc<isSliceEmptyArgs, isSliceEmptyReturn>("isSliceEmpty", {
        atlas: image.getAtlas(),
        voxelCount: image.voxelCount.toArray(),
        voxelComponents: image.voxelComponents,
        sliceNumber,
        viewType,
      })
      .then((result) =>
        this.setAnnotatedSlice(!result, image, sliceNumber, viewType),
      );
  }

  public reset() {
    // TODO: This can lead to race conditions and should be reworked in the future.
    // One solution would be to cancel any outstanding worker updates once reset is called
    this.annotatedSlices = [[], [], []];
  }
}
