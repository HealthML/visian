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
  width: 40px;
  padding: 4px 0;
  flex: 1 0;
`;

export const SliceSlider: React.FC = observer(() => {
  const store = useStore();

  // Handle slice changes
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
  const previousSliceRef = useRef<number>();
  useEffect(() => {
    if (previousSliceRef.current !== undefined) {
      setHasChanged(true);
      scheduleHide();
    }
    previousSliceRef.current = store?.editor.viewSettings.getSelectedSlice();
  }, [store?.editor.viewSettings.getSelectedSlice()]);

  // Value Label Formatting
  const formatValueLabel = useCallback(
    (values: number[]) => {
      if (!store?.editor.viewSettings.getMaxSlice())
        return `${Math.trunc(values[0])}`;

      // Pad slice number with leading zeros
      const maxPlaces =
        Math.floor(
          Math.log10(Math.ceil(store.editor.viewSettings.getMaxSlice()!)),
        ) + 1;

      return `${new Array(maxPlaces).fill("0").join("")}${Math.trunc(
        values[0],
      )}`.slice(-maxPlaces);
    },
    [store?.editor.viewSettings.getMaxSlice()],
  );

  const dimensionality = store?.editor.image?.dimensionality;
  return dimensionality && dimensionality > 2 ? (
    <StyledSheet
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
        max={store?.editor.viewSettings.getMaxSlice() || 0}
        value={store?.editor.viewSettings.getSelectedSlice()}
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
