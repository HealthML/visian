import { Image, ViewType } from "@visian/utils";
import { action, computed, makeObservable, observable, reaction } from "mobx";
import type { StoreContext } from "../../types";
import type { Editor } from "../editor";
import { condenseValues } from "./utils";

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
    this.annotatedSlices = image.getNonEmptySlices();
  }

  public inferAnnotatedSlice(
    image: Image | undefined,
    slice: number,
    viewType: ViewType = this.editor.viewSettings.mainViewType,
  ) {
    if (!image) return this.reset();
    this.annotatedSlices[viewType][slice] = !image.isSliceEmpty(
      slice,
      viewType,
    );
  }

  public reset() {
    this.annotatedSlices = [[], [], []];
  }
}
