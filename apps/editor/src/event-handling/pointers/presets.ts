import { dispatch } from "./dispatch";
import { classify, forPointers, pointerAdapter } from "./middleware";
import { Pointer, PointerEventData } from "./types";

export const pointerPreset = <ID = string>(
  forPointersFunction?: (
    pointer: Pointer<ID>,
    data: PointerEventData<ID>,
  ) => void,
) =>
  dispatch([
    classify<ID>(),
    pointerAdapter<ID>(),
    forPointersFunction && forPointers<ID>(forPointersFunction),
  ]);
