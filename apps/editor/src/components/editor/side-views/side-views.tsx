import {
  color,
  coverMixin,
  EventLike,
  Sheet,
  useUpdateOnResize,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";

const SideViewContainer = styled.div<{ shouldShowSideViews?: boolean }>`
  box-sizing: border-box;
  display: ${(props) => (props.shouldShowSideViews ? "flex" : "none")};
  flex-direction: column;
  position: relative;
  margin-right: 22px;
`;

const SideView = styled(Sheet)`
  border-radius: 10px;
  padding-bottom: 100%;
  pointer-events: auto;
  position: relative;
  user-select: none;
  width: 100%;
  background: ${color("sideViewSheet")};
  border: 1px solid ${color("sideViewBorder")}; ;
`;

const SideViewCanvas = styled.canvas`
  ${coverMixin}
  cursor: crosshair;
`;

export const SideViews = observer(() => {
  const store = useStore();
  const shouldShowSideViews =
    store?.editor.image && store.editor.viewSettings.shouldShowSideViews;

  // Refs Management
  const upperSideViewRef = useRef<HTMLCanvasElement>(null);
  const lowerSideViewRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    store?.setRef("upperSideView", upperSideViewRef);
    store?.setRef("lowerSideView", lowerSideViewRef);

    return () => {
      store?.setRef("upperSideView");
      store?.setRef("lowerSideView");
    };
  }, [store, upperSideViewRef, lowerSideViewRef]);

  // Pointer Event Handling
  const pointerDispatch = store?.pointerDispatch;
  const onPointerDownUpper = useCallback(
    (event: EventLike) => {
      if (pointerDispatch) pointerDispatch(event, "upperSideView");
    },
    [pointerDispatch],
  );
  const onPointerDownLower = useCallback(
    (event: EventLike) => {
      if (pointerDispatch) pointerDispatch(event, "lowerSideView");
    },
    [pointerDispatch],
  );

  // Side View Sizing
  const size = useUpdateOnResize();
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [sideViewSize, setSideViewSize] = useState(window.innerWidth * 0.4);
  useLayoutEffect(() => {
    if (!containerRef) return;
    setSideViewSize(
      Math.min(
        (containerRef.getBoundingClientRect().height - 20) / 2,
        window.innerWidth * 0.4,
      ),
    );
    console.log("up");
  }, [containerRef, shouldShowSideViews, size]);

  return (
    <SideViewContainer
      shouldShowSideViews={shouldShowSideViews}
      style={{ width: sideViewSize }}
      ref={setContainerRef}
    >
      <SideView style={{ marginBottom: 16 }}>
        <SideViewCanvas
          width={400}
          height={400}
          onPointerDown={onPointerDownUpper}
          ref={upperSideViewRef}
        />
      </SideView>
      <SideView>
        <SideViewCanvas
          width={400}
          height={400}
          onPointerDown={onPointerDownLower}
          ref={lowerSideViewRef}
        />
      </SideView>
    </SideViewContainer>
  );
});

export default SideViews;
