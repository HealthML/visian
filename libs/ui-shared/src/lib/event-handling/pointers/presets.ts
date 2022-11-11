import { dispatch } from "./dispatch";
import {
  classify,
  forGestures,
  forPointers,
  forUnidentifiedPointers,
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
  ID extends string | number | symbol = string,
>(config: {
  forUnidentifiedPointers?: (
    pointer: Pointer<undefined>,
    data: PointerEventData<ID>,
  ) => void;
  forPointers?: (pointer: Pointer<ID>, data: PointerEventData<ID>) => void;
  pointerPredicate?: (
    pointer: Pointer<ID>,
    data: TransformGestureEventData<ID>,
  ) => boolean;
  forGestures?: (
    gesture: TransformGestureWrapper<ID>,
    data: TransformGestureEventData<ID>,
  ) => void;
}) =>
  dispatch([
    classify<ID>(),
    pointerAdapter<ID>(Boolean(config.forUnidentifiedPointers)),
    config.forUnidentifiedPointers &&
      forUnidentifiedPointers<ID>(config.forUnidentifiedPointers),
    config.forPointers && forPointers<ID>(config.forPointers),
    gesturizeTransformations<ID>(config.pointerPredicate),
    config.forGestures && forGestures<ID>(config.forGestures),
  ]);
