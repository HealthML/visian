import {
  ColorMode,
  getTheme,
  GlobalStyles,
  Screen,
  ThemeProvider,
} from "@visian/ui-shared";
import { readMedicalImage } from "@visian/util";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Route, Switch } from "react-router-dom";
import styled from "styled-components";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import WebXRPolyfill from "webxr-polyfill";

import { DropZone } from "../components/drop-zone";
import { WebGLCanvas } from "../components/webgl-canvas";
import { VolumeRenderer } from "../lib/volume-renderer";
import { TextureAtlas } from "../lib/volume-renderer/utils";

import type * as THREE from "three";
new WebXRPolyfill();

let renderer: VolumeRenderer | undefined;

const StyledDropZone = styled(DropZone)`
  flex: 1;
  margin: 10% 0 10% 10%;
`;

const DropSheet = styled.div`
  align-items: stretch;
  display: flex;
  flex-direction: row;
  padding-right: 10%;
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
      document.body.appendChild(VRButton.createButton(renderer.renderer));
    }
    return () => {
      renderer?.dispose();
    };
  }, [forceUpdate]);

  const voxelCountRef = useRef<THREE.Vector3 | undefined>();

  // Load cached image
  useEffect(() => {
    (async () => {
      const [image, focus] = await Promise.all([
        TextureAtlas.fromStorage("image"),
        TextureAtlas.fromStorage("focus"),
      ]);
      if (image) {
        renderer?.setImage(image);
        voxelCountRef.current = image.voxelCount;
      }

      if (focus) renderer?.setFocus(focus);
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
        const atlas = TextureAtlas.fromITKImage(image);
        await Promise.all([
          atlas.store("image"),
          TextureAtlas.removeFromStorage("focus"),
        ]);
        renderer?.setImage(atlas);
        voxelCountRef.current = atlas.voxelCount;
        renderer?.setFocus();
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
        if (!voxelCountRef.current) throw new Error("No image loaded.");

        const focus = await readMedicalImage(fileList[0]);
        if (focus.imageType.dimension !== 3) {
          throw new Error("Only 3D volumetric images are supported.");
        }
        const atlas = TextureAtlas.fromITKImage(focus);
        if (!atlas.voxelCount.equals(voxelCountRef.current)) {
          throw new Error(
            "Focus volume does not match the original scan's size.",
          );
        }
        await atlas.store("focus");
        renderer?.setFocus(atlas);
      } catch (err) {
        console.error("The dropped file could not be opened:", err);
      }
      setIsDraggedOver(false);
      setFocusDropLabel(defaultFocusDropLabel);
    })();
  }, []);

  const dragTimerRef = useRef<NodeJS.Timer>();
  const dragOver = useCallback(() => {
    setIsDraggedOver(true);
    if (dragTimerRef.current) {
      clearTimeout(dragTimerRef.current);
    }
  }, [setIsDraggedOver]);

  const endDragOver = useCallback(() => {
    dragTimerRef.current = setTimeout(() => {
      setIsDraggedOver(false);
    }, 25);
  }, [setIsDraggedOver]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Switch>
        <Route path="/">
          <Screen
            onDragOver={dragOver}
            onDragEnd={endDragOver}
            onDragLeave={endDragOver}
          >
            <WebGLCanvas ref={canvasRef} />
            {isDraggedOver && (
              <DropSheet>
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
