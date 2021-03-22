import { useCallback, useRef, useState } from "react";

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
    dragTimerRef.current = setTimeout(() => {
      setIsDraggedOver(false);
    }, 25);
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
