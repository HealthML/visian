import {
  EventLike,
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
