import { dispatch } from "./dispatch";
import {
  classify,
  forGestures,
  forPointers,
  gesturizeTransformations,
  pointerAdapter,
  TransformGestureEventData,
  TransformGestureWrapper,
} from "./middleware";
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

export const transformGesturePreset = <
  ID extends string | number | symbol = string
>(
  forGesturesFunction?: (
    gesture: TransformGestureWrapper<ID>,
    data: TransformGestureEventData<ID>,
  ) => void,
) =>
  dispatch([
    classify<ID>(),
    pointerAdapter<ID>(),
    gesturizeTransformations<ID>(),
    forGesturesFunction && forGestures<ID>(forGesturesFunction),
  ]);
