import {
  AbstractEventType,
  DeviceType,
  EventMap,
  PointerEventData,
} from "../types";

export type ClassifyEventMap = Partial<
  Record<keyof EventMap, [DeviceType, AbstractEventType]>
>;

/** Default mouse/touch event map */
const defaultEventMap: ClassifyEventMap = {
  mousedown: ["mouse", "start"],
  mouseenter: ["mouse", "start"],
  mouseleave: ["mouse", "end"],
  mousemove: ["mouse", "move"],
  mouseup: ["mouse", "end"],
  pointercancel: ["pointer", "end"],
  pointerdown: ["pointer", "start"],
  pointerenter: ["mouse", "start"],
  pointerleave: ["mouse", "end"],
  pointermove: ["pointer", "move"],
  pointerout: ["pointer", "end"],
  pointerup: ["pointer", "end"],
  touchcancel: ["touch", "end"],
  touchend: ["touch", "end"],
  touchmove: ["touch", "move"],
  touchstart: ["touch", "start"],
  wheel: ["wheel", "move"],
};
export { defaultEventMap as eventMap };

/**
 * Classification middleware.
 * Adds `data.device` and `data.eventType` fields.
 *
 * @param eventMap An object mapping from `event.type` to `[deviceName, eventClass]`
 */
export const classify =
  <ID = string>(eventMap: ClassifyEventMap = defaultEventMap) =>
  (data: PointerEventData<ID>) => {
    const type = eventMap[data.event.type as keyof EventMap];

    if (type) {
      [data.eventOrigin, data.eventType] = type;
    }
  };
