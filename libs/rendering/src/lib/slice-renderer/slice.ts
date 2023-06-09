import * as TWEEN from "@tweenjs/tween.js";
import { IEditor, IImageLayer } from "@visian/ui-shared";
import { IDisposable, IDisposer, ViewType } from "@visian/utils";
import { autorun, reaction } from "mobx";
import * as THREE from "three";

import { SliceMaterial } from "./slice-material";
import { SliceRenderer } from "./slice-renderer";
import {
  BrushCursor,
  Crosshair,
  crosshairZ,
  getGeometrySize,
  HeatMap,
  heatMapZ,
  Outline,
  OverlayLineMaterial,
  OverlayPointsMaterial,
  OverlayRoundedPointsMaterial,
  OverlaySamPointsMaterial,
  Path,
  PreviewBrushCursor,
  SegPrompt,
  sliceMeshZ,
  synchCrosshairs,
  toolOverlayZ,
} from "./utils";

export class Slice extends THREE.Group implements IDisposable {
  public readonly baseSize = new THREE.Vector2();

  private workingVector2 = new THREE.Vector2();
  private workingVector3 = new THREE.Vector3();

  // Wrapper around every part of the slice.
  // Used to synch the crosshair position when the main view changes.
  private crosshairShiftGroup = new THREE.Group();
  public crosshairSynchOffset = new THREE.Vector2();

  private geometry = new THREE.PlaneGeometry();
  private mesh: THREE.Mesh;

  private heatMap: HeatMap;

  private crosshair: Crosshair;

  public brushCursor: BrushCursor;
  public outline: Outline;

  public previewBrushCursor: PreviewBrushCursor;

  private path: Path;
  private segPrompt: SegPrompt;

  private overlayLineMaterial: OverlayLineMaterial;
  private overlayPointsMaterial: OverlayPointsMaterial;
  private overlayRoundedPointsMaterial: OverlayRoundedPointsMaterial;
  private overlaySamPointsMaterial: OverlaySamPointsMaterial;
  private crosshairMaterial: OverlayLineMaterial;

  public isMainView: boolean;

  private disposers: IDisposer[] = [];

  constructor(private editor: IEditor, public viewType: ViewType) {
    super();
    this.geometry.scale(-1, 1, 1);

    this.add(this.crosshairShiftGroup);

    this.mesh = new THREE.Mesh(
      this.geometry,
      new SliceMaterial(editor, viewType),
    );
    this.mesh.position.z = sliceMeshZ;
    this.crosshairShiftGroup.add(this.mesh);

    this.heatMap = new HeatMap(editor, viewType, this.geometry);
    this.heatMap.position.z = heatMapZ;
    this.crosshairShiftGroup.add(this.heatMap);

    this.overlayLineMaterial = new OverlayLineMaterial(editor);
    this.overlayPointsMaterial = new OverlayPointsMaterial(editor);
    this.overlayRoundedPointsMaterial = new OverlayRoundedPointsMaterial(
      editor,
    );
    this.overlaySamPointsMaterial = new OverlaySamPointsMaterial(editor);
    this.crosshairMaterial = new OverlayLineMaterial(editor, {
      transparent: true,
      opacity: 0.5,
    });

    this.crosshair = new Crosshair(
      editor,
      this.viewType,
      this.crosshairMaterial,
    );
    this.crosshair.position.z = crosshairZ;
    this.crosshairShiftGroup.add(this.crosshair);

    this.brushCursor = new BrushCursor(
      editor,
      viewType,
      this.overlayLineMaterial,
      this.overlayPointsMaterial,
    );
    this.brushCursor.position.z = toolOverlayZ;
    this.crosshairShiftGroup.add(this.brushCursor);

    this.outline = new Outline(editor, viewType, this.overlayLineMaterial);
    this.outline.position.z = toolOverlayZ;
    this.crosshairShiftGroup.add(this.outline);

    this.previewBrushCursor = new PreviewBrushCursor(
      editor,
      viewType,
      this.overlayLineMaterial,
      this.overlayPointsMaterial,
    );
    this.previewBrushCursor.position.z = toolOverlayZ;
    this.crosshairShiftGroup.add(this.previewBrushCursor);

    this.isMainView =
      this.viewType === editor.activeDocument?.viewport2D.mainViewType;

    this.path = new Path(
      editor,
      viewType,
      this.overlayLineMaterial,
      this.overlayRoundedPointsMaterial,
    );
    this.crosshairShiftGroup.add(this.path);

    this.segPrompt = new SegPrompt(
      editor,
      viewType,
      this.overlayLineMaterial,
      this.overlaySamPointsMaterial,
    );
    this.crosshairShiftGroup.add(this.segPrompt);

    this.disposers.push(
      autorun(this.updateScale),
      autorun(this.updateOffset),
      autorun(this.updateRotation),
      reaction(
        () => this.editor.activeDocument?.mainImageLayer,
        (imageLayer?: IImageLayer) => {
          if (!imageLayer) return;

          const { image } = imageLayer;
          this.baseSize.copy(
            getGeometrySize(
              image.voxelCount,
              image.voxelSpacing,
              this.viewType,
            ),
          );
          this.updateScale();
        },
        { fireImmediately: true },
      ),
    );
  }

  public dispose() {
    this.crosshair.dispose();
    this.brushCursor.dispose();
    this.outline.dispose();
    (this.mesh.material as SliceMaterial).dispose();
    this.heatMap.dispose();
    this.disposers.forEach((disposer) => disposer());
    this.overlayLineMaterial.dispose();
    this.overlayPointsMaterial.dispose();
    this.overlayRoundedPointsMaterial.dispose();
    this.crosshairMaterial.dispose();
    this.path.dispose();
    this.segPrompt.dispose();
  }

  public setCrosshairSynchOffset(offset = new THREE.Vector2()) {
    this.crosshairSynchOffset.copy(offset);
    this.crosshairShiftGroup.position.set(-offset.x, -offset.y, 0);

    this.isMainView =
      this.viewType === this.editor.activeDocument?.viewport2D.mainViewType;
  }

  /**
   * Converts a position to virtual uv coordinates of this slice.
   * Virtual means, that uv coordinates can be outside the [0, 1] range aswell.
   */
  public getVirtualUVs(position: THREE.Vector3) {
    this.ensureMainViewTransformation();

    const localPosition = this.crosshairShiftGroup
      .worldToLocal(position)
      .addScalar(0.5);

    return {
      x: 1 - localPosition.x,
      y: localPosition.y,
    };
  }

  public ensureMainViewTransformation() {
    if (
      this.isMainView ||
      this.viewType !== this.editor.activeDocument?.viewport2D.mainViewType ||
      !this.editor.sliceRenderer
    ) {
      return;
    }

    const oldMainViewSlice = (
      this.editor.sliceRenderer as SliceRenderer
    ).slices.find((slice) => slice.isMainView);
    if (!oldMainViewSlice) return;

    synchCrosshairs(
      this.viewType,
      oldMainViewSlice.viewType,
      this,
      oldMainViewSlice,
      this.editor.activeDocument,
    );

    this.updateScale();
    this.updateOffset();
    this.updateRotation();

    this.updateMatrixWorld(true);
    this.crosshairShiftGroup.updateMatrixWorld(true);
  }

  private updateRotation = () => {
    const viewport = this.editor.activeDocument?.viewport2D;
    const wasRotationResetted =
      viewport?.rotationT === 0 &&
      viewport?.rotationS === 0 &&
      viewport?.rotationC === 0;

    if (
      !viewport ||
      (viewport.mainViewType !== this.viewType && !wasRotationResetted)
    )
      return;

    let rotation;
    switch (this.viewType) {
      case ViewType.Transverse:
        rotation = viewport.rotationT ?? 0;
        break;
      case ViewType.Sagittal:
        rotation = viewport.rotationS ?? 0;
        break;
      case ViewType.Coronal:
        rotation = viewport.rotationC ?? 0;
        break;
    }

    const targetQuaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      rotation,
    );

    new TWEEN.Tween({ t: 0 })
      .to({ t: 1 }, 250)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate((tween) => {
        this.quaternion.slerp(targetQuaternion, tween.t);
        this.editor.sliceRenderer?.lazyRender();
      })
      .start();
  };

  private updateScale = () => {
    this.workingVector2.copy(this.baseSize);

    if (this.viewType === this.editor.activeDocument?.viewport2D.mainViewType) {
      this.workingVector2.multiplyScalar(
        this.editor.activeDocument.viewport2D.zoomLevel,
      );
    } else {
      this.workingVector2.multiplyScalar(0.5);
    }

    this.scale.set(this.workingVector2.x, this.workingVector2.y, 1);

    this.editor.sliceRenderer?.lazyRender();
  };

  private updateOffset = () => {
    this.workingVector3.set(0, 0, 10);

    if (this.viewType === this.editor.activeDocument?.viewport2D.mainViewType) {
      this.workingVector3.set(
        this.editor.activeDocument.viewport2D.offset.x,
        this.editor.activeDocument.viewport2D.offset.y,
        0,
      );
    }

    this.position.copy(this.workingVector3);

    this.editor.sliceRenderer?.lazyRender();
  };
}
