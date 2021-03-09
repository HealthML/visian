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

  const imageSizeRef = useRef<number[] | undefined>();

  // Load cached image
  useEffect(() => {
    (async () => {
      const [file, focus] = await Promise.all([
        localForage.getItem<File>("image"),
        localForage.getItem<File>("focusVolume"),
      ]);
      if (file) {
        const image = await readMedicalImage(file);
        renderer?.setImage(image);
        imageSizeRef.current = image.size;
      }

      if (focus) renderer?.setFocusVolume(await readMedicalImage(focus));
    })();
  }, []);

  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const defaultImageDropLabel = "Drop your image here";
  const [imageDropLabel, setImageDropLabel] = useState(defaultImageDropLabel);

  /** Tries to load a new image from the first dropped file. */
  const dropImage = useCallback((fileList: FileList) => {
    setImageDropLabel("Loading...");
    if (!fileList.length) return;
    (async () => {
      try {
        const image = await readMedicalImage(fileList[0]);
        if (image.imageType.dimension !== 3) {
          throw new Error("Only 3D volumetric images are supported.");
        }
        await Promise.all([
          localForage.setItem("image", fileList[0]),
          localForage.removeItem("focusVolume"),
        ]);
        renderer?.setImage(image);
        imageSizeRef.current = image.size;
        renderer?.setFocusVolume();
      } catch (err) {
        console.error("The dropped file could not be opened:", err);
      }
      setIsDraggedOver(false);
      setImageDropLabel(defaultImageDropLabel);
    })();
  }, []);

  const defaultFocusDropLabel = "Drop a focus volume here";
  const [focusDropLabel, setFocusDropLabel] = useState(defaultFocusDropLabel);

  /** Tries to load a new image from the first dropped file. */
  const dropFocusVolume = useCallback((fileList: FileList) => {
    setFocusDropLabel("Loading...");
    if (!fileList.length) return;
    (async () => {
      try {
        if (!imageSizeRef.current) throw new Error("No image loaded.");

        const focus = await readMedicalImage(fileList[0]);
        if (focus.imageType.dimension !== 3) {
          throw new Error("Only 3D volumetric images are supported.");
        }
        if (
          focus.size[0] !== imageSizeRef.current[0] ||
          focus.size[1] !== imageSizeRef.current[1] ||
          focus.size[2] !== imageSizeRef.current[2]
        ) {
          throw new Error(
            "Focus volume does not match the original scan's size.",
          );
        }
        await localForage.setItem("focusVolume", fileList[1]);
        renderer?.setFocusVolume(focus);
      } catch (err) {
        console.error("The dropped file could not be opened:", err);
      }
      setIsDraggedOver(false);
      setFocusDropLabel(defaultFocusDropLabel);
    })();
  }, []);

  const dragOver = useCallback(() => {
    setIsDraggedOver(true);
  }, [setIsDraggedOver]);

  const endDragOver = useCallback(() => {
    // TODO: Fix flickering when dragging from one drop zone to the other
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
                  label={imageDropLabel}
                  onFileDrop={dropImage}
                />
                <StyledDropZone
                  alwaysShown
                  label={focusDropLabel}
                  onFileDrop={dropFocusVolume}
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
