import {
  ColorMode,
  getTheme,
  GlobalStyles,
  Screen,
  ThemeProvider,
} from "@visian/ui-shared";
import { readMedicalImage } from "@visian/util";
import localForage from "localforage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Route, Switch } from "react-router-dom";
import styled from "styled-components";

import { DropZone } from "../components/drop-zone";
import { WebGLCanvas } from "../components/webgl-canvas";
import { VolumeRenderer } from "../lib/volume-renderer";

let renderer: VolumeRenderer | undefined;

const StyledDropZone = styled(DropZone)`
  flex: 1;
  margin: 12px 0 12px 12px;
`;

const DropSheet = styled.div`
  align-items: stretch;
  display: flex;
  flex-direction: row;
  padding-right: 12px;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
`;

export function App() {
  const [mode] = useState<ColorMode>("dark");
  const theme = getTheme(mode);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Since the renderer is volatile state we trick React to force
  // an update when necessary by assigning a new object as state
  // through forceUpdate.
  const [, forceUpdateHelper] = useState({});
  const forceUpdate = useCallback(() => {
    // Here we asign the new object to force the update
    forceUpdateHelper({});
  }, [forceUpdateHelper]);

  useEffect(() => {
    if (canvasRef.current) {
      renderer = new VolumeRenderer(canvasRef.current);

      forceUpdate();
    }
    return () => {
      renderer?.dispose();
    };
  }, [forceUpdate]);

  // Load cached image
  useEffect(() => {
    (async () => {
      const file = await localForage.getItem<File>("image");
      if (file) renderer?.setImage(await readMedicalImage(file));

      const focus = await localForage.getItem<File>("focusVolume");
      if (focus) renderer?.setFocusVolume(await readMedicalImage(focus));
    })();
  }, []);

  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const defaultDropZoneLabel = "Drag scan here";
  const [dropZoneLabel, setDropZoneLabel] = useState(defaultDropZoneLabel);

  /** Tries to load a new image from the first dropped file. */
  const onFileDrop = useCallback((fileList: FileList) => {
    setDropZoneLabel("Loading...");
    if (!fileList.length) return;
    (async () => {
      try {
        const image = await readMedicalImage(fileList[0]);
        if (image.imageType.dimension !== 3) {
          throw new Error("Only 3D volumetric images are supported.");
        }
        await localForage.setItem("image", fileList[0]);
        if (image) renderer?.setImage(image);

        if (fileList.length > 1) {
          const focus = await readMedicalImage(fileList[1]);
          if (focus.imageType.dimension !== 3) {
            throw new Error("Only 3D volumetric images are supported.");
          }
          if (
            focus.size[0] !== image.size[0] ||
            focus.size[1] !== image.size[1] ||
            focus.size[2] !== image.size[2]
          ) {
            throw new Error(
              "Focus volume does not match the original scan's size.",
            );
          }
          await localForage.setItem("focusVolume", fileList[1]);
          if (focus) renderer?.setFocusVolume(focus);
        } else {
          renderer?.setFocusVolume();
          await localForage.removeItem("focusVolume");
        }
      } catch (err) {
        console.error("The dropped file could not be opened:", err);
      }
      setIsDraggedOver(false);
      setDropZoneLabel(defaultDropZoneLabel);
    })();
  }, []);

  const dragOver = useCallback(() => {
    setIsDraggedOver(true);
  }, [setIsDraggedOver]);

  const endDragOver = useCallback(() => {
    setIsDraggedOver(false);
  }, [setIsDraggedOver]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Switch>
        <Route path="/">
          <Screen onDragOver={dragOver}>
            <WebGLCanvas ref={canvasRef} />
            {isDraggedOver && (
              <DropSheet onDragEnd={endDragOver} onDragLeave={endDragOver}>
                <StyledDropZone
                  alwaysShown
                  label={dropZoneLabel}
                  onFileDrop={onFileDrop}
                />
              </DropSheet>
            )}
          </Screen>
        </Route>
      </Switch>
    </ThemeProvider>
  );
}

export default App;
