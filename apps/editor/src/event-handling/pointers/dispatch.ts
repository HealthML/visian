import { IDisposer } from "@visian/util";

import {
  EventLike,
  EventMap,
  EventMiddleware,
  PointerEventData,
  PointerState,
} from "./types";

/**
 * Event dispatcher.
 * Starts a middleware chain.
 *
 * @param event The original event.
 * @param id An optional reference id to track drag interactions.
 */
export const dispatch = <ID = string>(
  middleware: (
    | EventMiddleware<PointerEventData<ID>, PointerState<ID>>
    | false
    | undefined
  )[],
) => {
  const context: PointerState<ID> = { pointers: {} };

  return (event: EventLike, id?: ID, ...args: unknown[]) => {
    const data = { event, args: [id, ...args] };

    middleware.forEach((currentMiddleware) => {
      if (currentMiddleware) currentMiddleware(data, context);
    });
  };
};

/**
 * The event types of all events that require global event listeners
 * for the adapters to work.
 *
 * Should be used with `registerDispatch`.
 */
export const globalListenerTypes: (keyof EventMap)[] = [
  "pointercancel",
  "pointermove",
  "pointerup",
];

/**
 * Adds event listeners for the given event types to an element.
 *
 * @param dispatchFunction The dispatch function.
 * @param eventTypes The event types.
 * @param element The element (defaults to `document`).
 */
export const registerDispatch = <ID = string>(
  dispatchFunction: (event: EventLike, id?: ID, ...args: unknown[]) => void,
  eventTypes: (keyof EventMap)[],
  element: EventTarget = document,
): IDisposer => {
  eventTypes.forEach((eventType) => {
    element.addEventListener(eventType, dispatchFunction, { passive: false });
  });

  return () => {
    eventTypes.forEach((eventType) => {
      element.removeEventListener(eventType, dispatchFunction);
    });
  };
};
