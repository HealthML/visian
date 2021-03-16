import { AbsoluteCover, Screen, WebGLCanvas } from "@visian/ui-shared";
import React, { useRef } from "react";

import { UIOverlay } from "../components/editor";

export const EditorScreen: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  return (
    <Screen title="Visian Editor">
      <AbsoluteCover>
        <WebGLCanvas ref={canvasRef} />
      </AbsoluteCover>
      <UIOverlay />
    </Screen>
  );
};

export default EditorScreen;
