import { InvisibleButton, Sheet, Slider } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";

const StyledSheet = styled(Sheet)`
  width: 40px;
  padding: 4px 0;
  flex: 1 0;
`;

export const SliceSlider: React.FC = observer(() => {
  const store = useStore();

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

  const dimensionality = store?.editor.image?.dimensionality;
  return dimensionality && dimensionality > 2 ? (
    <StyledSheet>
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
      />
      <InvisibleButton
        icon="arrowDown"
        isActive={false}
        onPointerDown={decreaseSelectedSlice}
      />
    </StyledSheet>
  ) : null;
});
