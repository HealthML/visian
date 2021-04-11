import { useCallback, useEffect, useRef, useState } from "react";
import ResizeSensor from "css-element-queries/src/ResizeSensor";

export const useIsDraggedOver = () => {
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const dragTimerRef = useRef<NodeJS.Timer>();

  const onDragOver = useCallback(() => {
    setIsDraggedOver(true);
    if (dragTimerRef.current) {
      clearTimeout(dragTimerRef.current);
    }
  }, [setIsDraggedOver]);

  const onDragEnd = useCallback(() => {
    dragTimerRef.current = (setTimeout(() => {
      setIsDraggedOver(false);
    }, 25) as unknown) as NodeJS.Timer;
  }, [setIsDraggedOver]);

  const onDrop = useCallback(() => {
    setIsDraggedOver(false);
    if (dragTimerRef.current) {
      clearTimeout(dragTimerRef.current);
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

    const resizeSensor = new ResizeSensor(document.body, (size) => {
      setSize(`${size.width}x${size.height}`);
    });
    const rect = document.body.getBoundingClientRect();
    setSize(`${rect.width}x${rect.height}`);

    return () => {
      resizeSensor.detach();
    };
  }, [isActive]);

  return size;
};
