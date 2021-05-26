import { IDocument, IEditor, IImageLayer } from "@visian/ui-shared";
import { Image, ViewType } from "@visian/utils";
import * as THREE from "three";

import { getMaxSpriteSize } from "./slice-size";

export const getSpriteAspectRatio = (image: Image) => {
  const maxSpriteSize = getMaxSpriteSize(image.voxelCount, image.voxelSpacing);
  return maxSpriteSize.x / maxSpriteSize.y;
};

/**
 * @returns a quadruple of paddings for the sprite in the main view:
 * [topPadding, rightPadding, bottomPadding, leftPadding]
 */
export const getMainViewPaddings = (editor: IEditor) => {
  const floatingUIRect = editor.refs.uiOverlay.current?.getBoundingClientRect();
  const undoRedoButtonsRect = editor.refs.undoRedoButtons.current?.getBoundingClientRect();
  const toolbarRect = editor.refs.toolbar.current?.getBoundingClientRect();
  const viewSettingsRect = editor.refs.viewSettings.current?.getBoundingClientRect();
  const sliceSliderRect = editor.refs.sliceSlider.current?.getBoundingClientRect();
  const sideViewsRect = editor.refs.sideViews.current?.getBoundingClientRect();

  const topMargin =
    undoRedoButtonsRect && floatingUIRect
      ? undoRedoButtonsRect.top - floatingUIRect.top
      : 0;
  const undoRedoPadding = undoRedoButtonsRect
    ? undoRedoButtonsRect.height + 2 * topMargin
    : 0;

  const leftMargin =
    toolbarRect && floatingUIRect ? toolbarRect.left - floatingUIRect.left : 0;
  const toolBarPadding = toolbarRect ? toolbarRect.width + 2 * leftMargin : 0;

  const rightMargin =
    floatingUIRect && viewSettingsRect
      ? floatingUIRect.right - viewSettingsRect.right
      : 0;
  const viewSettingsPadding = viewSettingsRect
    ? viewSettingsRect.width + 2 * rightMargin
    : 0;

  const sliceSliderPadding =
    editor.activeDocument &&
    editor.activeDocument.layers.length &&
    (editor.activeDocument.layers[1] as IImageLayer).is3DLayer &&
    sliceSliderRect &&
    // sliceSliderRect.right can be 0, when the slice slider isn't rendered.
    sliceSliderRect.right > 0
      ? sliceSliderRect.width + 2 * rightMargin
      : 0;

  const sideViewsDistance =
    // sideViewsRect.right can be 0, when the side views aren't rendered.
    floatingUIRect && sideViewsRect && sideViewsRect.right > 0
      ? floatingUIRect.right - sideViewsRect.right
      : 0;
  const sideViewsPadding =
    editor.activeDocument?.viewport2D.showSideViews && sideViewsRect
      ? sideViewsRect.width + sideViewsDistance + rightMargin
      : 0;

  return [
    undoRedoPadding,
    Math.max(
      Math.max(sliceSliderPadding, viewSettingsPadding),
      sideViewsPadding,
    ),
    0,
    toolBarPadding,
  ];
};

export const setMainCameraPlanes = (
  document: IDocument,
  mainCanvas: HTMLCanvasElement,
  mainCamera: THREE.OrthographicCamera,
) => {
  const [
    topPadding,
    rightPadding,
    bottomPadding,
    leftPadding,
  ] = getMainViewPaddings(document.editor);

  const sizeBetweenOverlays = {
    x: mainCanvas.width - (leftPadding + rightPadding),
    y: mainCanvas.height - (bottomPadding + topPadding),
  };

  const availableAspectRatio = sizeBetweenOverlays.x / sizeBetweenOverlays.y;
  const image =
    document.layers.length < 2
      ? undefined
      : (document.layers[1] as IImageLayer).image;
  const spriteAspectRatio = image ? getSpriteAspectRatio(image) : 1;

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

  mainCamera.left =
    spriteEdgePlanes.left -
    ((2 * spriteEdgePlanes.right * mainCanvas.width) / sizeBetweenOverlays.x -
      2 * spriteEdgePlanes.right) *
      (leftPadding / (rightPadding + leftPadding));
  mainCamera.right =
    spriteEdgePlanes.right +
    ((2 * spriteEdgePlanes.right * mainCanvas.width) / sizeBetweenOverlays.x -
      2 * spriteEdgePlanes.right) *
      (rightPadding / (rightPadding + leftPadding));
  mainCamera.bottom =
    spriteEdgePlanes.bottom -
    ((2 * spriteEdgePlanes.top * mainCanvas.height) / sizeBetweenOverlays.y -
      2 * spriteEdgePlanes.top) *
      (bottomPadding / (topPadding + bottomPadding));
  mainCamera.top =
    spriteEdgePlanes.top +
    ((2 * spriteEdgePlanes.top * mainCanvas.height) / sizeBetweenOverlays.y -
      2 * spriteEdgePlanes.top) *
      (topPadding / (topPadding + bottomPadding));

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
