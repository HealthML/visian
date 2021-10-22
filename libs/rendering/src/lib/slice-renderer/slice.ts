import { SliceRenderer } from "@visian/rendering";
import { IEditor, IImageLayer } from "@visian/ui-shared";
import { IDisposable, IDisposer, ViewType } from "@visian/utils";
import { autorun, reaction } from "mobx";
import * as THREE from "three";

import { SliceMaterial } from "./slice-material";
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
  PreviewBrushCursor,
  sliceMeshZ,
  synchCrosshairs,
  toolOverlayZ,
} from "./utils";

export class Slice extends THREE.Group implements IDisposable {
  public readonly baseSize = new THREE.Vector2();

  private workingVector = new THREE.Vector2();

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

  private overlayLineMaterial: OverlayLineMaterial;
  private overlayPointsMaterial: OverlayPointsMaterial;
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

    this.disposers.push(
      autorun(this.updateScale),
      autorun(this.updateOffset),
      reaction(
        () => this.editor.activeDocument?.baseImageLayer,
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

    const oldMainViewSlice = (this.editor
      .sliceRenderer as SliceRenderer).slices.find((slice) => slice.isMainView);
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

    this.updateMatrixWorld(true);
    this.crosshairShiftGroup.updateMatrixWorld(true);
  }

  private updateScale = () => {
    this.workingVector.copy(this.baseSize);

    if (this.viewType === this.editor.activeDocument?.viewport2D.mainViewType) {
      this.workingVector.multiplyScalar(
        this.editor.activeDocument.viewport2D.zoomLevel,
      );
    }

    this.scale.set(this.workingVector.x, this.workingVector.y, 1);

    this.editor.sliceRenderer?.lazyRender();
  };

  private updateOffset = () => {
    this.workingVector.setScalar(0);

    if (this.viewType === this.editor.activeDocument?.viewport2D.mainViewType) {
      this.workingVector.set(
        this.editor.activeDocument.viewport2D.offset.x,
        this.editor.activeDocument.viewport2D.offset.y,
      );
    }

    this.position.set(this.workingVector.x, this.workingVector.y, 0);

    this.editor.sliceRenderer?.lazyRender();
  };
}
