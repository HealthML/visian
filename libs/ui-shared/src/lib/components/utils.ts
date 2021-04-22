import { useCallback, useEffect, useRef, useState } from "react";

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
