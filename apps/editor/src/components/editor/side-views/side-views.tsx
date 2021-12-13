import { getOrder } from "@visian/rendering";
import {
  color,
  EventLike,
  InvisibleButton,
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

const SideViewContainer = styled.div<{ showSideViews?: boolean }>`
  box-sizing: border-box;
  display: ${(props) => (props.showSideViews ? "flex" : "none")};
  flex-direction: column;
  position: relative;
`;

const SideViewWrapper = styled.div`
  bottom: 0;
  position: absolute;
  right: 0;
  top: 0;

  margin-right: 22px;
`;

const SideViewFullscreen = styled(InvisibleButton)`
  cursor: pointer;
  position: absolute;
  left: 10px;
  top: 10px;
  width: 20px;
  height: 20px;
  z-index: 100;
`;

const SideView = styled.div`
  border-radius: 10px;
  cursor: crosshair;
  padding-bottom: 100%;
  pointer-events: auto;
  position: relative;
  user-select: none;
  width: 100%;
  border: 1px solid ${color("sideViewBorder")};
`;

export const SideViews = observer(() => {
  const store = useStore();
  const showSideViews =
    store?.editor.activeDocument?.has3DLayers &&
    store.editor.activeDocument.viewSettings.viewMode === "2D" &&
    store.editor.activeDocument.viewport2D.showSideViews;

  // Ref Management
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    store?.setRef("sideViews", wrapperRef);

    return () => {
      store?.setRef("sideViews");
    };
  }, [store, wrapperRef]);

  const upperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    store?.setRef("upperSideView", upperRef);

    return () => {
      store?.setRef("upperSideView");
    };
  }, [store, upperRef]);

  const lowerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    store?.setRef("lowerSideView", lowerRef);

    return () => {
      store?.setRef("lowerSideView");
    };
  }, [store, lowerRef]);

  // Pointer Event Handling
  const pointerDispatch = store?.pointerDispatch;
  const upperOnPointerDown = useCallback(
    (event: EventLike) => {
      if (pointerDispatch) pointerDispatch(event, "upperSideView");
    },
    [pointerDispatch],
  );
  const lowerOnPointerDown = useCallback(
    (event: EventLike) => {
      if (pointerDispatch) pointerDispatch(event, "lowerSideView");
    },
    [pointerDispatch],
  );

  // Side View Sizing
  const size = useUpdateOnResize(showSideViews);
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
  }, [containerRef, showSideViews, size]);

  // Main View Buttons
  const [isUpperHovered, setIsUpperHovered] = useState(false);
  const [isLowerHovered, setIsLowerHovered] = useState(false);

  const upperOnPointerEnter = useCallback(() => {
    setIsUpperHovered(true);
  }, []);
  const upperOnPointerLeave = useCallback(() => {
    setIsUpperHovered(false);
  }, []);

  const lowerOnPointerEnter = useCallback(() => {
    setIsLowerHovered(true);
  }, []);
  const lowerOnPointerLeave = useCallback(() => {
    setIsLowerHovered(false);
  }, []);

  const setAsMainView = useCallback(
    (canvasIndex: number) => {
      if (!store?.editor.activeDocument) return;
      const order = getOrder(
        store.editor.activeDocument.viewport2D.mainViewType,
      );
      const newMainView = order[canvasIndex];
      store.editor.activeDocument.viewport2D.setMainViewType(newMainView);
    },
    [store],
  );

  const setUpperAsMainView = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setAsMainView(1);
    },
    [setAsMainView],
  );

  const setLowerAsMainView = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setAsMainView(2);
    },
    [setAsMainView],
  );

  return (
    <SideViewContainer showSideViews={showSideViews} ref={setContainerRef}>
      <SideViewWrapper style={{ width: sideViewSize }} ref={wrapperRef}>
        <SideView
          style={{ marginBottom: 16 }}
          onPointerEnter={upperOnPointerEnter}
          onPointerLeave={upperOnPointerLeave}
          onPointerDown={upperOnPointerDown}
          ref={upperRef}
        >
          {isUpperHovered && (
            <SideViewFullscreen
              icon="fullScreenSmall"
              onPointerDown={setUpperAsMainView}
            />
          )}
        </SideView>
        <SideView
          onPointerEnter={lowerOnPointerEnter}
          onPointerLeave={lowerOnPointerLeave}
          onPointerDown={lowerOnPointerDown}
          ref={lowerRef}
        >
          {isLowerHovered && (
            <SideViewFullscreen
              icon="fullScreenSmall"
              onPointerDown={setLowerAsMainView}
            />
          )}
        </SideView>
      </SideViewWrapper>
    </SideViewContainer>
  );
});

export default SideViews;
