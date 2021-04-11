import { Image, ViewType } from "@visian/utils";
import * as THREE from "three";

import { Editor } from "../../../models";
import { getMaxSpriteSize } from "./slice-size";

export const getSpriteAspectRatio = (image: Image) => {
  const maxSpriteSize = getMaxSpriteSize(image.voxelCount, image.voxelSpacing);
  return maxSpriteSize.x / maxSpriteSize.y;
};

export const getMainViewPaddings = (_editor: Editor) => {
  // TODO: Adapt based on the active overlays.
  return [0, 0, 0, 0];
};

export const setMainCameraPlanes = (
  editor: Editor,
  mainCanvas: HTMLCanvasElement,
  mainCamera: THREE.OrthographicCamera,
) => {
  const [
    topPadding,
    rightPadding,
    bottomPadding,
    leftPadding,
  ] = getMainViewPaddings(editor);

  const sizeBetweenOverlays = {
    x: mainCanvas.width - (leftPadding + rightPadding),
    y: mainCanvas.height - (bottomPadding + topPadding),
  };

  const availableAspectRatio = sizeBetweenOverlays.x / sizeBetweenOverlays.y;
  const spriteAspectRatio = editor.image
    ? getSpriteAspectRatio(editor.image)
    : 1;

  const spriteEdgePlanes = { left: 0, right: 0, bottom: 0, top: 0 };
  if (spriteAspectRatio <= availableAspectRatio) {
    // height is limiting
    if (spriteAspectRatio <= 1) {
      // sprites are tall
      spriteEdgePlanes.left = -availableAspectRatio;
      spriteEdgePlanes.right = availableAspectRatio;
      spriteEdgePlanes.bottom = -1;
      spriteEdgePlanes.top = 1;
    } else {
      // sprites are wide
      spriteEdgePlanes.bottom = -1 / spriteAspectRatio;
      spriteEdgePlanes.top = 1 / spriteAspectRatio;
      spriteEdgePlanes.left = spriteEdgePlanes.bottom * availableAspectRatio;
      spriteEdgePlanes.right = spriteEdgePlanes.top * availableAspectRatio;
    }
  }
  // width is limiting
  else if (spriteAspectRatio <= 1) {
    // sprites are tall
    spriteEdgePlanes.left = -spriteAspectRatio;
    spriteEdgePlanes.right = spriteAspectRatio;
    spriteEdgePlanes.bottom = spriteEdgePlanes.left / availableAspectRatio;
    spriteEdgePlanes.top = spriteEdgePlanes.right / availableAspectRatio;
  } else {
    // sprites are wide
    spriteEdgePlanes.left = -1;
    spriteEdgePlanes.right = 1;
    spriteEdgePlanes.bottom = -1 / availableAspectRatio;
    spriteEdgePlanes.top = 1 / availableAspectRatio;
  }

  // TODO: Add the paddings here.
  // Old code for this:
  // mainCamera.left =
  //   spriteEdgePlanes.left -
  //   ((2 * spriteEdgePlanes.right * mainCanvas.width) / sizeBetweenOverlays.x -
  //     2 * spriteEdgePlanes.right) *
  //     (leftPadding / (rightPadding + leftPadding));
  // mainCamera.right =
  //   spriteEdgePlanes.right +
  //   ((2 * spriteEdgePlanes.right * mainCanvas.width) / sizeBetweenOverlays.x -
  //     2 * spriteEdgePlanes.right) *
  //     (rightPadding / (rightPadding + leftPadding));
  // mainCamera.bottom =
  //   spriteEdgePlanes.bottom -
  //   ((2 * spriteEdgePlanes.top * mainCanvas.height) / sizeBetweenOverlays.y -
  //     2 * spriteEdgePlanes.top) *
  //     (bottomPadding / (topPadding + bottomPadding));
  // mainCamera.top =
  //   spriteEdgePlanes.top +
  //   ((2 * spriteEdgePlanes.top * mainCanvas.height) / sizeBetweenOverlays.y -
  //     2 * spriteEdgePlanes.top) *
  //     (topPadding / (topPadding + bottomPadding));

  mainCamera.left = spriteEdgePlanes.left;
  mainCamera.right = spriteEdgePlanes.right;
  mainCamera.top = spriteEdgePlanes.top;
  mainCamera.bottom = spriteEdgePlanes.bottom;

  mainCamera.updateProjectionMatrix();
};

export const getOrder = (mainView: ViewType) => {
  const order = [mainView];

  switch (mainView) {
    case ViewType.Transverse:
      order[1] = ViewType.Sagittal;
      order[2] = ViewType.Coronal;
      break;
    case ViewType.Sagittal:
      order[1] = ViewType.Transverse;
      order[2] = ViewType.Coronal;
      break;
    case ViewType.Coronal:
      order[1] = ViewType.Transverse;
      order[2] = ViewType.Sagittal;
      break;
  }

  return order;
};

export const resizeRenderer = (
  renderer: THREE.WebGLRenderer,
  eagerRender?: () => void,
) => {
  if (!renderer.domElement.parentElement) return;

  renderer.setSize(
    renderer.domElement.parentElement.clientWidth,
    renderer.domElement.parentElement.clientHeight,
  );

  if (eagerRender) eagerRender();
};
