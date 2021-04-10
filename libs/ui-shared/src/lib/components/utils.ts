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
  callback?: () => void,
  activateHandler?: boolean,
) => {
  useEffect(() => {
    const handleOutsidePress = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        if (callback && activateHandler !== false) callback();
      }
    };

    document.addEventListener("pointerdown", handleOutsidePress);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePress);
    };
  }, [activateHandler, callback, ref]);
};

export const useUpdateOnResize = () => {
  const [size, setSize] = useState<string | undefined>(undefined);
  useEffect(() => {
    const resizeSensor = new ResizeSensor(document.body, (size) => {
      setSize(`${size.width}x${size.height}`);
    });

    return () => {
      resizeSensor.detach();
    };
  }, []);

  return size;
};
