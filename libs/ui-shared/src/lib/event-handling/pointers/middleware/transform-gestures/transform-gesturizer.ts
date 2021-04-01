import { TransformData } from "./transform-data";

import type {
  AbstractEventType,
  EventMiddleware,
  Pointer,
  PointerEventData,
  PointerState,
} from "../../types";
import { TransformGesture } from "./transform-gesture";

/** Event processor state extension to capture the current transform gestures. */
export interface TransformGestureState<
  ID extends string | number | symbol = string
> {
  transformGestures?: Partial<Record<ID, TransformGesture>>;
}

export interface TransformGestureWrapper<ID = string> {
  /** The id of the associated domain object. */
  id: ID;

  /** An abstract event type that indicates the current phase in the lifecycle of the gesture.  */
  eventType: AbstractEventType | "rebase";

  /** The transform gesture. */
  gesture: TransformGesture;

  /** All pointers contributing to this gesture. */
  pointers: Pointer<ID>[];
}

export interface TransformGestureEventData<
  ID extends string | number | symbol = string
> extends PointerEventData<ID> {
  transformGestures?: Partial<Record<ID, TransformGestureWrapper<ID>>>;
}

/** Returns a new gesture event. */
export const buildGestureWrapper = <ID = string>(
  eventType: AbstractEventType | "rebase",
  gesture: TransformGesture,
  id: ID,
  pointers: Pointer<ID>[],
): TransformGestureWrapper<ID> => ({
  id,
  eventType,
  gesture,
  pointers,
});

/**
 * Returns an array of only those pointers that belong to the
 * given entity id and pass the predicate.
 *
 * @param pointers The initial array of pointers
 * @param id The entity id
 * @param predicate An optional predicate
 */
export const filterPointers = <ID>(
  pointers: Pointer<ID>[],
  id: ID,
  predicate?: (pointer: Pointer<ID>) => boolean,
) =>
  Object.values(pointers).filter(
    (pointer) => pointer.id === id && (!predicate || predicate(pointer)),
  );

/**
 * Transform gesturizer, manages transform gestures and dispatches gesture events.
 *
 * @param splitRebaseEvents If set, ends the current gesture and starts a new one
 * if its pointers change. This is usually needed if the UI that applies resulting
 * transformation data needs to support zooming to a vanishing point.
 * @param pointerPredicate Used to filter the processed pointers.
 */
export const gesturizeTransformations = <
  ID extends number | string | symbol = string,
  T extends TransformGestureState<ID> &
    PointerState<ID> = TransformGestureState<ID> & PointerState<ID>
>(
  pointerPredicate?: (
    pointer: Pointer<ID>,
    data: TransformGestureEventData<ID>,
  ) => boolean,
): EventMiddleware<TransformGestureEventData<ID>, T> => (data, context) => {
  const boundPointerPredicate = pointerPredicate
    ? (pointer: Pointer<ID>) => pointerPredicate(pointer, data)
    : () => true;

  const { ids } = data;
  if (!ids || !data.pointers) return;

  const pointerMap = context.pointers;
  if (!pointerMap) return;
  const pointers = Object.values(
    pointerMap as NonNullable<PointerState<ID>["pointers"]>,
  );

  let gestures = context.transformGestures as NonNullable<
    TransformGestureState<ID>["transformGestures"]
  >;

  switch (data.eventType) {
    case "start":
      ids.forEach((id) => {
        let gesture: TransformGesture | undefined = gestures
          ? gestures[id]
          : undefined;

        const filteredPointers = filterPointers(
          pointers,
          id,
          boundPointerPredicate,
        );
        if (!filteredPointers.length) return;

        if (gesture) {
          gesture.rebase(TransformData.fromPointers(filteredPointers));

          // Add gesture to event data
          if (!data.transformGestures) data.transformGestures = {};
          data.transformGestures[id] = buildGestureWrapper(
            "rebase",
            gesture,
            id,
            filteredPointers,
          );
        } else {
          gesture = new TransformGesture(
            TransformData.fromPointers(filteredPointers),
            { id },
          );

          // Write new gesture to state
          if (!gestures) gestures = {};
          gestures[id] = gesture;
          context.transformGestures = gestures;

          // Add gesture to event data
          if (!data.transformGestures) data.transformGestures = {};
          data.transformGestures[id] = buildGestureWrapper(
            "start",
            gesture,
            id,
            filteredPointers,
          );
        }
      });
      break;
    case "move":
      if (!gestures) return;
      ids.forEach((id) => {
        const gesture: TransformGesture | undefined = gestures[id];
        if (!gesture) return;

        const filteredPointers = filterPointers(
          pointers,
          id,
          boundPointerPredicate,
        );
        if (!filteredPointers.length) return;

        gesture.setTarget(TransformData.fromPointers(filteredPointers));

        // Add gesture to event data
        if (!data.transformGestures) data.transformGestures = {};
        data.transformGestures[id] = buildGestureWrapper(
          "move",
          gesture,
          id,
          filteredPointers,
        );
      });
      break;
    case "end":
      if (!gestures) return;
      ids.forEach((id) => {
        const gesture: TransformGesture | undefined = gestures[id];
        if (!gesture) return;

        const currentPointers = filterPointers(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          data.pointers!,
          id,
          boundPointerPredicate,
        );
        const filteredPointers = filterPointers(
          pointers,
          id,
          boundPointerPredicate,
        );
        const filteredPointersCount = filteredPointers.length;
        if (!(filteredPointersCount || currentPointers.length)) return;

        gesture.setTarget(
          TransformData.fromPointers([...currentPointers, ...filteredPointers]),
        );

        // Check if more pointers are involved in this gesture
        if (filteredPointersCount) {
          gesture.rebase(TransformData.fromPointers(filteredPointers));

          // Add gesture to event data
          if (!data.transformGestures) data.transformGestures = {};
          data.transformGestures[id] = buildGestureWrapper(
            "rebase",
            gesture,
            id,
            filteredPointers,
          );
        } else {
          delete gestures[id];

          // Add gesture to event data
          if (!data.transformGestures) data.transformGestures = {};
          data.transformGestures[id] = buildGestureWrapper(
            "end",
            gesture,
            id,
            filteredPointers,
          );
        }
      });
      break;
    default:
      break;
  }
};

/** Gesture mapper, runs the mapping function for every gesture. */
export const forGestures = <ID extends string | number | symbol = string>(
  mappingFunction: (
    gesture: TransformGestureWrapper<ID>,
    data: TransformGestureEventData<ID>,
  ) => void,
) => (data: TransformGestureEventData<ID>) => {
  if (!data.transformGestures) return;

  Object.values<TransformGestureWrapper<ID>>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.transformGestures as any,
  ).forEach((gesture) => {
    mappingFunction(gesture, data);
  });
};
