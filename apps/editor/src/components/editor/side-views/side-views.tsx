import { resizeRenderer } from "@visian/rendering";
import {
  color,
  computeStyleValue,
  coverMixin,
  EventLike,
  isFirefox,
  Sheet,
  sheetNoise,
  useUpdateOnResize,
} from "@visian/ui-shared";
import ResizeSensor from "css-element-queries/src/ResizeSensor";
import { observer } from "mobx-react-lite";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import tc from "tinycolor2";

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

const SideView = styled(Sheet)`
  border-radius: 10px;
  cursor: crosshair;
  padding-bottom: 100%;
  pointer-events: auto;
  position: relative;
  user-select: none;
  width: 100%;
  background: ${sheetNoise},
    // Firefox does not support a blurred background yet
    ${isFirefox()
        ? computeStyleValue(
            [color("sideViewSheet"), color("background")],
            (sheet, background) => tc.mix(sheet, background, 80).toRgbString(),
          )
        : color("sideViewSheet")};
  border: 1px solid ${color("sideViewBorder")};

  canvas {
    ${coverMixin}
  }
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

  const [upperRef, setUpperRef] = useState<HTMLDivElement | null>(null);
  const upperCanvas = store?.editor.renderers[1].domElement;
  useEffect(() => {
    let resizeSensor: ResizeSensor | undefined;
    if (store && upperRef && upperCanvas) {
      upperRef.appendChild(upperCanvas);
      resizeSensor = new ResizeSensor(upperRef, () => {
        resizeRenderer(
          store.editor.renderers[1],
          store.editor.sliceRenderer?.eagerRender,
        );
      });
    }

    return () => {
      if (resizeSensor) resizeSensor.detach();
      if (upperRef) upperRef.innerHTML = "";
    };
  }, [store, upperCanvas, upperRef]);

  const [lowerRef, setLowerRef] = useState<HTMLDivElement | null>(null);
  const lowerCanvas = store?.editor.renderers[2].domElement;
  useEffect(() => {
    let resizeSensor: ResizeSensor | undefined;
    if (store && lowerRef && lowerCanvas) {
      lowerRef.appendChild(lowerCanvas);
      resizeSensor = new ResizeSensor(lowerRef, () => {
        resizeRenderer(
          store.editor.renderers[2],
          store.editor.sliceRenderer?.eagerRender,
        );
      });
    }

    return () => {
      if (resizeSensor) resizeSensor.detach();
      if (lowerRef) lowerRef.innerHTML = "";
    };
  }, [lowerCanvas, lowerRef, store]);

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

  return (
    <SideViewContainer showSideViews={showSideViews} ref={setContainerRef}>
      <SideViewWrapper style={{ width: sideViewSize }} ref={wrapperRef}>
        <SideView
          style={{ marginBottom: 16 }}
          onPointerDown={onPointerDownUpper}
          ref={setUpperRef}
        />
        <SideView onPointerDown={onPointerDownLower} ref={setLowerRef} />
      </SideViewWrapper>
    </SideViewContainer>
  );
});

export default SideViews;
