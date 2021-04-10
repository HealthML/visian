import { coverMixin, EventLike, Sheet, color } from "@visian/ui-shared";
import ResizeSensor from "css-element-queries/src/ResizeSensor";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  const divRef = useRef<HTMLDivElement>(null);
  const upperSideViewRef = useRef<HTMLCanvasElement>(null);
  const lowerSideViewRef = useRef<HTMLCanvasElement>(null);

  const store = useStore();
  useEffect(() => {
    store?.setRef("upperSideView", upperSideViewRef);
    store?.setRef("lowerSideView", lowerSideViewRef);

    return () => {
      store?.setRef("upperSideView");
      store?.setRef("lowerSideView");
    };
  }, [store, upperSideViewRef, lowerSideViewRef]);

  const pointerDispatch = store?.pointerDispatch;
  const onPointerDownUpper = useCallback(
    (event: EventLike) => {
      if (!pointerDispatch) return;
      pointerDispatch(event, "upperSideView");
    },
    [pointerDispatch],
  );
  const onPointerDownLower = useCallback(
    (event: EventLike) => {
      if (!pointerDispatch) return;
      pointerDispatch(event, "lowerSideView");
    },
    [pointerDispatch],
  );

  // Force the side view container to re-render on layout changes:
  const [size, setSize] = useState<string | undefined>(undefined);
  useEffect(() => {
    const resizeSensor = new ResizeSensor(document.body, (size) => {
      setSize(`${size.width}x${size.height}`);
    });

    const rect = document.body.getBoundingClientRect();
    setSize(`${rect.width}x${rect.height}`);

    return () => {
      resizeSensor.detach();
    };
  }, []);

  const [sideViewSize, setSideViewSize] = useState(window.innerWidth * 0.3);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (divRef.current) {
      setSideViewSize(
        Math.min(
          (divRef.current.getBoundingClientRect().height - 20) / 2,
          window.innerWidth * 0.3,
        ),
      );
    }
  }, [size]);

  return (
    <SideViewContainer
      shouldShowSideViews={
        store?.editor.image && store.editor.viewSettings.shouldShowSideViews
      }
      style={{ width: sideViewSize }}
      ref={divRef}
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
