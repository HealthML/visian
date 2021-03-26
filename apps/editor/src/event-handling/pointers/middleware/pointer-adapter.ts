import {
  DeviceType,
  EventMiddleware,
  Pointer,
  PointerEventData,
  PointerState,
} from "../types";

const buildPointerId = (event: PointerEvent) => `${event.pointerId}`;

export const buildPointerDetail = (event: PointerEvent) => ({
  buttons: event.buttons,
  cancel: event.type === "pointercancel",
  clientX: event.clientX,
  clientY: event.clientY,
  event,
  pressure: event.buttons ? event.pressure || 1 : 0,
  tiltX: event.tiltX,
  tiltY: event.tiltY,
  twist: event.twist,
});

const buildPointer = <ID = string>(
  id: ID,
  event: PointerEvent,
  identifier = buildPointerId(event),
) =>
  new Pointer<ID>(id, buildPointerDetail(event), {
    device: event.pointerType as DeviceType,
    identifier,
    startTime: event.timeStamp,

    altKey: event.altKey,
    button: event.button,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
  });

/**
 * Pointer adapter, generates & tracks pointer data for pointer events.
 *
 * @param handleUnidentified If set, events not associated to an entity are
 * still recorded in `data.unidentifiedPointers`.
 */
export const pointerAdapter = <
  ID = string,
  T extends PointerState<ID> = PointerState<ID>
>(
  handleUnidentified = false,
): EventMiddleware<PointerEventData<ID>, T> => (data, context) => {
  if (data.eventOrigin !== "pointer") return;

  const type = data.eventType;
  let { pointers } = context;

  if (type === "start") {
    // Get id from caller arguments
    const id = data.args[0] as ID;

    if (id !== undefined) {
      data.event.preventDefault();
      data.event.stopPropagation();

      // Create pointer
      const pointer = buildPointer(id, data.event as PointerEvent);

      // Write id & pointer to context
      data.ids = [id];
      data.pointers = [pointer];

      // Write pointer to state
      if (!pointers) pointers = {};
      (pointers as PointerState<ID>["pointers"])[
        buildPointerId(data.event as PointerEvent)
      ] = pointer;
      context.pointers = pointers;
    }
  } else if (pointers) {
    // Get registered pointer (if any)
    const pointer = pointers[buildPointerId(data.event as PointerEvent)];

    if (pointer) {
      data.event.preventDefault();

      // Update pointer
      pointer.detail = buildPointerDetail(data.event as PointerEvent);

      // Write id & pointer to context
      data.ids = [pointer.id];
      data.pointers = [pointer];

      if (type === "end") {
        delete pointers[buildPointerId(data.event as PointerEvent)];
      }
    }
  }

  if (handleUnidentified && !data.ids) {
    data.event.preventDefault();
    data.unidentifiedPointers = [
      buildPointer(undefined, data.event as PointerEvent),
    ];
  }
};

/** Pointer mapper, generates actions from pointers. */
export const forPointers = <ID = string>(
  mappingFunction: (pointer: Pointer<ID>, data: PointerEventData<ID>) => void,
) => (data: PointerEventData<ID>) => {
  if (!data.pointers) return;

  data.pointers.forEach((pointer) => {
    mappingFunction(pointer, data);
  });
};
