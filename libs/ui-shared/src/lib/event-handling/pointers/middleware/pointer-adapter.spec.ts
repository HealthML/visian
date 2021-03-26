import { Pointer, PointerEventData, PointerState } from "../types";
import { pointerAdapter } from "./pointer-adapter";

const voidFn = () => undefined;
const buildPointerEvent = (type: string, data: Partial<PointerEvent>) =>
  ({
    type,
    button: 0,
    buttons: 0,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    timeStamp: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    preventDefault: voidFn,
    stopPropagation: voidFn,
    ...data,
  } as PointerEvent);

describe("pointerAdapter", () => {
  const context: PointerState = { pointers: {} };
  let pointer: Pointer<string | undefined>;

  beforeEach(() => {
    pointer = new Pointer(
      "uuid",
      {
        buttons: 1,
        cancel: false,
        clientX: 32,
        clientY: 24,
        event: buildPointerEvent("pointerdown", {
          buttons: 1,
          clientX: 32,
          clientY: 24,
          pointerId: 0,
          pointerType: "mouse",
        }),
        pressure: 1,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
      },
      {
        device: "mouse",
        identifier: "0",
        startTime: expect.anything(),
        altKey: false,
        button: 0,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      },
    );
  });

  it("should do nothing for an unclassified event", () => {
    const data: PointerEventData = {
      args: [],
      event: buildPointerEvent("pointerdown", {
        buttons: 1,
        clientX: 0,
        clientY: 0,
        pointerId: 0,
        pointerType: "mouse",
      }),
    };

    expect(pointerAdapter()(data, context)).toBe(undefined);

    expect(context.pointers).toEqual({});
    expect(data.pointers).toBe(undefined);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toBe(undefined);
  });

  it("should do nothing for an unrecognized event", () => {
    const data: PointerEventData = {
      args: ["uuid"],
      eventOrigin: "pointer",
      event: buildPointerEvent("pointerdown", {
        buttons: 1,
        clientX: 0,
        clientY: 0,
        pointerId: 0,
        pointerType: "mouse",
      }),
      eventType: "undef" as never,
    };

    expect(pointerAdapter()(data, context)).toBe(undefined);

    expect(context.pointers).toEqual({});
    expect(data.pointers).toBe(undefined);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toBe(undefined);
  });

  it("should do nothing if no id is passed with start event", () => {
    const data: PointerEventData = {
      args: [],
      eventOrigin: "pointer",
      event: buildPointerEvent("pointerdown", {
        buttons: 1,
        clientX: 0,
        clientY: 0,
        pointerId: 0,
        pointerType: "mouse",
      }),
      eventType: "start",
    };

    expect(pointerAdapter()(data, context)).toBe(undefined);

    expect(context.pointers).toEqual({});
    expect(data.pointers).toBe(undefined);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toBe(undefined);
  });

  it("should create a new pointer", () => {
    const data: PointerEventData = {
      args: ["uuid"],
      eventOrigin: "pointer",
      event: buildPointerEvent("pointerdown", {
        buttons: 1,
        clientX: 32,
        clientY: 24,
        pointerId: 0,
        pointerType: "mouse",
      }),
      eventType: "start",
    };

    expect(pointerAdapter()(data, context)).toBe(undefined);

    expect(context.pointers).toEqual({ 0: pointer });
    expect(data.pointers).toEqual([pointer]);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toEqual(["uuid"]);
  });

  it("should update a pointer", () => {
    const data: PointerEventData = {
      args: [],
      eventOrigin: "pointer",
      event: buildPointerEvent("pointermove", {
        buttons: 1,
        clientX: 64,
        clientY: 32,
        pointerId: 0,
        pointerType: "mouse",
      }),
      eventType: "move",
    };

    expect(pointerAdapter()(data, context)).toBe(undefined);

    pointer.detail = {
      buttons: 1,
      cancel: false,
      clientX: 64,
      clientY: 32,
      event: buildPointerEvent("pointermove", {
        buttons: 1,
        clientX: 64,
        clientY: 32,
        pointerId: 0,
        pointerType: "mouse",
      }),
      pressure: 1,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
    };
    expect(context.pointers).toEqual({ 0: pointer });
    expect(data.pointers).toEqual([pointer]);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toEqual(["uuid"]);
  });

  it("should delete a pointer", () => {
    const data: PointerEventData = {
      args: [],
      eventOrigin: "pointer",
      event: buildPointerEvent("pointerup", {
        clientX: 64,
        clientY: 32,
        pointerId: 0,
        pointerType: "mouse",
      }),
      eventType: "end",
    };

    expect(pointerAdapter()(data, context)).toBe(undefined);

    pointer.detail = {
      buttons: 0,
      cancel: false,
      clientX: 64,
      clientY: 32,
      event: buildPointerEvent("pointerup", {
        clientX: 64,
        clientY: 32,
        pointerId: 0,
        pointerType: "mouse",
      }),
      pressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
    };
    expect(context.pointers).toEqual({});
    expect(data.pointers).toEqual([pointer]);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toEqual(["uuid"]);
  });

  it("should do nothing when trying to modify a non-existent pointer", () => {
    const data: PointerEventData = {
      args: [],
      eventOrigin: "pointer",
      event: buildPointerEvent("pointermove", {
        buttons: 1,
        clientX: 64,
        clientY: 32,
        pointerId: 0,
        pointerType: "mouse",
      }),
      eventType: "move",
    };

    expect(pointerAdapter()(data, context)).toBe(undefined);

    expect(context.pointers).toEqual({});
    expect(data.pointers).toBe(undefined);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toBe(undefined);
  });

  it("should handle an unidentified pointer", () => {
    const data: PointerEventData = {
      args: [],
      eventOrigin: "pointer",
      event: buildPointerEvent("pointermove", {
        clientX: 64,
        clientY: 32,
        pointerId: 0,
        pointerType: "mouse",
      }),
      eventType: "move",
    };

    expect(pointerAdapter(true)(data, context)).toBe(undefined);

    pointer.id = undefined;
    pointer.detail = {
      buttons: 0,
      cancel: false,
      clientX: 64,
      clientY: 32,
      event: buildPointerEvent("pointermove", {
        clientX: 64,
        clientY: 32,
        pointerId: 0,
        pointerType: "mouse",
      }),
      pressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
    };
    expect(context.pointers).toEqual({});
    expect(data.unidentifiedPointers).toEqual([pointer]);
    expect(data.ids).toBe(undefined);
  });
});
