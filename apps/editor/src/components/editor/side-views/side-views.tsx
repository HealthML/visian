import { coverMixin, Sheet } from "@visian/ui-shared";
import ResizeSensor from "css-element-queries/src/ResizeSensor";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";

const SideViewContainer = styled.div<{ shouldShowSideViews?: boolean }>`
  box-sizing: border-box;
  display: ${(props) => (props.shouldShowSideViews ? "flex" : "none")};
  flex-direction: column;
  position: relative;
`;

const SideView = styled(Sheet)`
  border-radius: 10px;
  margin-top: 40px;
  padding-bottom: 100%;
  position: relative;
  user-select: none;
  width: 100%;
`;

const SideViewCanvas = styled.canvas`
  ${coverMixin}
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

  // Force the side view container to re-render on layout changes:
  const [size, setSize] = useState<string | undefined>(undefined);
  useEffect(() => {
    const resizeSensor = new ResizeSensor(document.body, (size) => {
      setSize(`${size.width}x${size.height}`);
    });

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
          (divRef.current.getBoundingClientRect().height - 40) / 2 - 40,
          window.innerWidth * 0.3,
        ),
      );
    }
  }, [size]);

  return (
    <SideViewContainer
      shouldShowSideViews={
        store?.editor.image && store.editor.shouldShowSideViews
      }
      style={{ width: sideViewSize }}
      ref={divRef}
    >
      <SideView>
        <SideViewCanvas width={400} height={400} ref={upperSideViewRef} />
      </SideView>
      <SideView>
        <SideViewCanvas width={400} height={400} ref={lowerSideViewRef} />
      </SideView>
    </SideViewContainer>
  );
});

export default SideViews;
