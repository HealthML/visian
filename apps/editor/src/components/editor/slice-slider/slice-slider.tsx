import {
  duration,
  InvisibleButton,
  Sheet,
  Slider,
  Theme,
  useDelay,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled, { useTheme } from "styled-components";

import { useStore } from "../../../app/root-store";

// Styled Components
const StyledSheet = styled(Sheet)`
  width: 38px;
  padding: 4px 0;
  flex: 1 0;
`;

export const SliceSlider: React.FC = observer(() => {
  const store = useStore();

  // Ref Management
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    store?.setRef("sliceSlider", ref);

    return () => {
      store?.setRef("sliceSlider");
    };
  }, [store, ref]);

  // Handle Slice Changes
  const setSelectedSlice = useCallback(
    (value: number | number[]) => {
      store?.editor.viewSettings.setSelectedSlice(value as number);
    },
    [store],
  );
  const increaseSelectedSlice = useCallback(() => {
    store?.editor.viewSettings.stepSelectedSlice(1);
  }, [store]);
  const decreaseSelectedSlice = useCallback(() => {
    store?.editor.viewSettings.stepSelectedSlice(-1);
  }, [store]);

  // Control Value Label Visibility
  const [isHovered, setIsHovered] = useState(false);
  const [isDragged, setIsDragged] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
  }, []);
  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleDragStart = useCallback(() => {
    setIsDragged(true);
  }, []);
  const handleDragEnd = useCallback(() => {
    setIsDragged(false);
  }, []);

  const theme = useTheme() as Theme;
  const [scheduleHide] = useDelay(
    useCallback(() => {
      setHasChanged(false);
    }, []),
    duration("autoHideDelay")({ theme }) as number,
  );

  const currentSlice = store?.editor.viewSettings.getSelectedSlice();
  const previousSliceRef = useRef(currentSlice);
  useEffect(() => {
    if (previousSliceRef.current !== undefined) {
      setHasChanged(true);
      scheduleHide();
    }
    previousSliceRef.current = currentSlice;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlice]);

  // Value Label Formatting
  const maxSlice = store?.editor.viewSettings.getMaxSlice();
  const formatValueLabel = useCallback(
    (values: number[]) => {
      if (!maxSlice) return `${Math.trunc(values[0] + 1)}`;

      // Pad slice number with leading zeros
      const maxPlaces = Math.floor(Math.log10(Math.ceil(maxSlice))) + 1;
      return `${new Array(maxPlaces).fill("0").join("")}${Math.trunc(
        values[0] + 1,
      )}`.slice(-maxPlaces);
    },
    [maxSlice],
  );

  return store?.editor.isIn3DMode ? (
    <StyledSheet
      ref={ref}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <InvisibleButton
        icon="arrowUp"
        isActive={false}
        onPointerDown={increaseSelectedSlice}
      />
      <Slider
        isVertical
        isInverted
        min={0}
        max={store?.editor.viewSettings.getMaxSlice()}
        value={store?.editor.viewSettings.getSelectedSlice()}
        markers={store?.editor.markers.markers.map((marker) => ({
          color: store?.editor.viewSettings.annotationColor,
          value: marker,
        }))}
        onChange={setSelectedSlice}
        onStart={handleDragStart}
        onEnd={handleDragEnd}
        showFloatingValueLabel={isHovered || isDragged || hasChanged}
        formatValueLabel={formatValueLabel}
      />
      <InvisibleButton
        icon="arrowDown"
        isActive={false}
        onPointerDown={decreaseSelectedSlice}
      />
    </StyledSheet>
  ) : null;
});
