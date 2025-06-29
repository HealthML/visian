import { Pixel } from "@visian/utils";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Returns a function that, when called, triggers a re-render of the current
 * component.
 */
export const useForceUpdate = () => {
  const [, setHelperValue] = useState({});
  return useCallback(() => {
    setHelperValue({});
  }, []);
};

/** Returns a function ref that updates all passed refs when called. */
export const useMultiRef = <T>(...refs: React.ForwardedRef<T>[]) =>
  useCallback((element: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);

export const useForwardEvent = <E>(...callbacks: ((event: E) => void)[]) =>
  useCallback((event: E) => {
    callbacks.forEach((callback) => {
      callback(event);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, callbacks);

export const useIsDraggedOver = () => {
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const dragTimerRef = useRef<NodeJS.Timer>();

  const onDragOver = useCallback(() => {
    setIsDraggedOver(true);
    if (dragTimerRef.current !== undefined) {
      clearTimeout(dragTimerRef.current);
      dragTimerRef.current = undefined;
    }
  }, [setIsDraggedOver]);

  const onDragEnd = useCallback(() => {
    if (dragTimerRef.current !== undefined) {
      clearTimeout(dragTimerRef.current);
    }
    dragTimerRef.current = setTimeout(() => {
      setIsDraggedOver(false);
    }, 50) as unknown as NodeJS.Timer;
  }, [setIsDraggedOver]);

  const onDrop = useCallback(() => {
    setIsDraggedOver(false);
    if (dragTimerRef.current !== undefined) {
      clearTimeout(dragTimerRef.current);
      dragTimerRef.current = undefined;
    }
  }, [setIsDraggedOver]);

  return [
    isDraggedOver,
    { onDragOver, onDragEnd, onDragLeave: onDragEnd, onDrop },
  ] as [
    boolean,
    {
      onDragOver: typeof onDragOver;
      onDragEnd: typeof onDragEnd;
      onDragLeave: typeof onDragEnd;
      onDrop: typeof onDragEnd;
    },
  ];
};

export const useFilePicker = (
  callback: (arg: Event) => void,
  multiple = true,
) => {
  const inputElement: HTMLInputElement = useMemo(
    () => document.createElement("input"),
    [],
  );
  useEffect(() => {
    inputElement.addEventListener("change", callback);
    return () => {
      inputElement.removeEventListener("change", callback);
    };
  }, [callback, inputElement]);

  return useCallback(() => {
    inputElement.value = "";
    inputElement.type = "file";
    inputElement.multiple = multiple;
    inputElement.dispatchEvent(new MouseEvent("click"));
  }, [inputElement, multiple]);
};

export const useUpdateOnResize = (isActive = true) => {
  const [size, setSize] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!isActive) return;

    const handleResize = () => {
      setSize(`${window.innerWidth}x${window.innerHeight}`);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isActive]);

  return size;
};

export const useDelay = (
  callback: () => void,
  delay: number,
): [() => void, () => void] => {
  const timerRef = useRef<NodeJS.Timer>();

  const cancel = useCallback(() => {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const schedule = useCallback(() => {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(callback, delay) as unknown as NodeJS.Timer;
  }, [callback, delay]);

  useEffect(
    () => () => {
      if (timerRef.current !== undefined) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    },
    [],
  );

  return [schedule, cancel];
};

export const useShortTap = <T extends Element>(
  handleShortTap: (event: React.PointerEvent<T>) => void,
  maxDuration = 300,
  canActivate = true,
): [() => void, (event: React.PointerEvent<T>) => void] => {
  const timeRef = useRef<number | undefined>();

  const startTap = useCallback(() => {
    if (canActivate) timeRef.current = Date.now();
  }, [canActivate]);
  const stopTap = useCallback(
    (event: React.PointerEvent<T>) => {
      if (timeRef.current === undefined) return;
      if (Date.now() - timeRef.current <= maxDuration) handleShortTap(event);
      timeRef.current = undefined;
    },
    [handleShortTap, maxDuration],
  );

  return [startTap, stopTap];
};

export const useLongPress = <T extends Element>(
  handleLongPress: (event: React.PointerEvent<T>) => void,
  minDuration = 500,
  canActivate = true,
): [(event: React.PointerEvent<T>) => void, () => void] => {
  const timerRef = useRef<NodeJS.Timer | undefined>();

  const startPress = useCallback(
    (event: React.PointerEvent<T>) => {
      if (canActivate) {
        timerRef.current = setTimeout(() => {
          handleLongPress(event);
        }, minDuration) as unknown as NodeJS.Timer;
      }
    },
    [canActivate, handleLongPress, minDuration],
  );

  const stopPress = useCallback(() => {
    if (timerRef.current === undefined) return;
    clearTimeout(timerRef.current);
    timerRef.current = undefined;
  }, []);

  return [startPress, stopPress];
};

export const useDoubleTap = <T extends Element>(
  handleDoubleTap: (event: React.PointerEvent<T>) => void,
  maxDelay = 500,
): ((event: React.PointerEvent<T>) => void) => {
  const timeRef = useRef<number | undefined>();

  const startTap = useCallback(
    (event: React.PointerEvent<T>) => {
      if (timeRef.current && Date.now() - timeRef.current <= maxDelay) {
        handleDoubleTap(event);
        timeRef.current = undefined;
      } else {
        timeRef.current = Date.now();
      }
    },
    [handleDoubleTap, maxDelay],
  );

  return startTap;
};

export const useOutsidePress = <T extends HTMLElement>(
  ref: React.RefObject<T>,
  callback?: (event: PointerEvent) => void,
  activateHandler?: boolean,
  ignoreUnmounted?: boolean,
) => {
  const handleOutsidePress = useCallback(
    (event: PointerEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        (document.body.contains(event.target as Node) || ignoreUnmounted)
      ) {
        if (callback) callback(event);
      }
    },
    [callback, ignoreUnmounted, ref],
  );

  const [schedule, cancel] = useDelay(
    useCallback(() => {
      document.addEventListener("pointerdown", handleOutsidePress);
    }, [handleOutsidePress]),
    35,
  );

  useEffect(() => {
    if (activateHandler) {
      schedule();

      return () => {
        cancel();
        document.removeEventListener("pointerdown", handleOutsidePress);
      };
    }

    cancel();
    document.removeEventListener("pointerdown", handleOutsidePress);
  }, [activateHandler, cancel, schedule, handleOutsidePress]);
};

export interface RelativePositionConfig<P = void> {
  /** The anchor element or position. */
  anchor?: HTMLElement | SVGSVGElement | Pixel | null;

  /**
   * If set to `true`, the position is actively updated.
   * Defaults to `true`.
   */
  isActive?: boolean;

  /**
   * If set to `true`, the position will be returned relative to its offset
   * parent.
   */
  positionRelativeToOffsetParent?: boolean;

  /** The position relative to its parent. */
  position?: P;

  /**
   * The positioned element's distance to its parent.
   * Defaults to a value based on the current theme.
   */
  distance?: number;

  /** Style overrides. */
  style?: React.CSSProperties;
}

export interface RelativePositionStyleConfig<P = void>
  extends Pick<RelativePositionConfig<P>, "distance" | "position"> {
  /** The parent element's bounding client rect. */
  rect: DOMRect;

  /** The offset parent's bounding client rect (if any). */
  offsetRect?: DOMRect;
}

/**
 * Returns a style object that absolutely positions an element next to the
 * parent element it refers to.
 */
export const useRelativePosition = <P = void>(
  computeStyle: (config: RelativePositionStyleConfig<P>) => React.CSSProperties,
  {
    anchor,
    isActive = true,
    positionRelativeToOffsetParent,
    position,
    distance,
    style: styleOverride,
  }: RelativePositionConfig<P>,
): React.CSSProperties => {
  useUpdateOnResize(isActive);

  const [style, setStyle] = useState<React.CSSProperties>({});
  const rectRef = useRef<Partial<DOMRect>>({});
  const offsetRectRef = useRef<Partial<DOMRect> | undefined>();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (!isActive) return;

    const rect: DOMRect | undefined =
      !anchor || (anchor as Element).nodeName
        ? (anchor as Element)?.getBoundingClientRect()
        : new DOMRect((anchor as Pixel).x, (anchor as Pixel).y);
    if (!rect) return;

    const offsetRect = positionRelativeToOffsetParent
      ? (anchor as HTMLElement)?.offsetParent?.getBoundingClientRect()
      : undefined;

    // Prevent unnecessary updates
    if (
      rectRef.current.top === rect.top &&
      rectRef.current.left === rect.left &&
      rectRef.current.bottom === rect.bottom &&
      rectRef.current.right === rect.right &&
      offsetRectRef.current?.top === offsetRect?.top &&
      offsetRectRef.current?.left === offsetRect?.left &&
      offsetRectRef.current?.bottom === offsetRect?.bottom &&
      offsetRectRef.current?.right === offsetRect?.right
    ) {
      return;
    }
    rectRef.current = rect;
    offsetRectRef.current = offsetRect;

    setStyle(computeStyle({ position, distance, rect, offsetRect }));
  });

  return styleOverride ? { ...style, ...styleOverride } : style;
};
