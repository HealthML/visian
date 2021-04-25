import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
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
    dragTimerRef.current = (setTimeout(() => {
      setIsDraggedOver(false);
    }, 25) as unknown) as NodeJS.Timer;
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
    { onDragOver, onDragEnd, onDragLeave: onDragEnd, onDrop: onDrop },
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

export const useOutsidePress = <T extends HTMLElement>(
  ref: React.RefObject<T>,
  callback?: (event: PointerEvent) => void,
  activateHandler?: boolean,
) => {
  useEffect(() => {
    const handleOutsidePress = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        if (callback && activateHandler !== false) callback(event);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePress);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePress);
    };
  }, [activateHandler, callback, ref]);
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
    timerRef.current = (setTimeout(callback, delay) as unknown) as NodeJS.Timer;
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== undefined) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, []);

  return [schedule, cancel];
};

export interface RelativePositionConfig<P extends string> {
  /** The parent element. */
  parentElement?: HTMLElement | SVGSVGElement | null;

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

export interface RelativePositionStyleConfig<P extends string>
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
export const useRelativePosition = <P extends string>(
  computeStyle: (config: RelativePositionStyleConfig<P>) => React.CSSProperties,
  {
    parentElement,
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

    const rect = parentElement?.getBoundingClientRect();
    if (!rect) return;

    const offsetRect = positionRelativeToOffsetParent
      ? (parentElement as HTMLElement)?.offsetParent?.getBoundingClientRect()
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
