import {
  AbsoluteCover,
  coverMixin,
  getTheme,
  GlobalStyles,
  Screen,
  ThemeProvider,
  WebGLCanvas,
} from "@visian/ui-shared";
import { readMedicalImage } from "@visian/util";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Route, Switch } from "react-router-dom";
import styled from "styled-components";
import WebXRPolyfill from "webxr-polyfill";

import { DropZone } from "../components/drop-zone";
import { UIOverlay } from "../components/ui-overlay";
import { VolumeRenderer } from "../lib/volume-renderer";
import { TextureAtlas } from "../lib/volume-renderer/utils";

import type * as THREE from "three";
new WebXRPolyfill();

const StyledDropZone = styled(DropZone)`
  flex: 1;
  margin: 10% 0 10% 10%;
`;

const DropSheet = styled.div`
  ${coverMixin}

  align-items: stretch;
  display: flex;
  flex-direction: row;
  padding-right: 10%;
`;

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [renderer, setRenderer] = useState<VolumeRenderer | undefined>();
  useEffect(() => {
    let newRenderer: VolumeRenderer | undefined;
    if (canvasRef.current) {
      newRenderer = new VolumeRenderer(canvasRef.current);
      setRenderer(newRenderer);
    }
    return () => {
      newRenderer?.dispose();
    };
  }, []);

  const voxelCountRef = useRef<THREE.Vector3 | undefined>();

  // Load cached image
  useEffect(() => {
    if (!renderer) return;
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
  }, [renderer]);

  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const defaultImageDropLabel = "Drop your image here";
  const [imageDropLabel, setImageDropLabel] = useState(defaultImageDropLabel);

  /** Tries to load a new image from the first dropped file. */
  const dropImage = useCallback(
    (fileList: FileList) => {
      if (!renderer) return;
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
    },
    [renderer],
  );

  const defaultFocusDropLabel = "Drop a focus volume here";
  const [focusDropLabel, setFocusDropLabel] = useState(defaultFocusDropLabel);

  /** Tries to load a new image from the first dropped file. */
  const dropFocusVolume = useCallback(
    (fileList: FileList) => {
      if (!renderer) return;
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
    },
    [renderer],
  );

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

  const theme = getTheme(
    renderer && renderer.backgroundValue > 0.5 ? "light" : "dark",
  );
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
            <AbsoluteCover>
              <WebGLCanvas
                ref={canvasRef}
                backgroundColor={renderer?.backgroundColor}
              />
            </AbsoluteCover>
            {renderer && <UIOverlay renderer={renderer} />}
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

export default observer(App);
