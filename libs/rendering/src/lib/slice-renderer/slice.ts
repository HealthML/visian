import { IEditor } from "@visian/ui-shared";
import { IDisposable, IDisposer, ViewType } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

import { RenderedImage } from "../rendered-image";
import {
  AnnotationSliceMaterial,
  ImageSliceMaterial,
  SliceMaterial,
} from "./slice-material";
import {
  annotationMeshZ,
  BrushCursor,
  toolOverlayZ,
  Crosshair,
  crosshairZ,
  getGeometrySize,
  imageMeshZ,
  Outline,
  PreviewBrushCursor,
} from "./utils";

export class Slice extends THREE.Group implements IDisposable {
  public readonly baseSize = new THREE.Vector2();

  private workingVector = new THREE.Vector2();

  // Wrapper around every part of the slice.
  // Used to synch the crosshair position when the main view changes.
  private crosshairShiftGroup = new THREE.Group();
  public crosshairSynchOffset = new THREE.Vector2();

  private geometry = new THREE.PlaneGeometry();

  private imageMaterial: SliceMaterial;
  public imageMesh: THREE.Mesh;

  private annotationMaterial: SliceMaterial;
  private annotationMesh: THREE.Mesh;

  private crosshair: Crosshair;

  public brushCursor: BrushCursor;
  public outline: Outline;

  public previewBrushCursor: PreviewBrushCursor;

  private disposers: IDisposer[] = [];

  constructor(private editor: IEditor, private viewType: ViewType) {
    super();
    this.geometry.scale(-1, 1, 1);

    this.add(this.crosshairShiftGroup);

    this.imageMaterial = new ImageSliceMaterial(editor, viewType);
    this.imageMesh = new THREE.Mesh(this.geometry, this.imageMaterial);
    this.imageMesh.position.z = imageMeshZ;
    this.imageMesh.userData = {
      viewType,
    };
    this.crosshairShiftGroup.add(this.imageMesh);

    this.annotationMaterial = new AnnotationSliceMaterial(editor, viewType);
    this.annotationMesh = new THREE.Mesh(
      this.geometry,
      this.annotationMaterial,
    );
    this.annotationMesh.position.z = annotationMeshZ;
    this.crosshairShiftGroup.add(this.annotationMesh);

    this.crosshair = new Crosshair(this.viewType, editor);
    this.crosshair.position.z = crosshairZ;
    this.crosshairShiftGroup.add(this.crosshair);

    this.brushCursor = new BrushCursor(editor, viewType);
    this.brushCursor.position.z = toolOverlayZ;
    this.crosshairShiftGroup.add(this.brushCursor);

    this.outline = new Outline(editor, viewType);
    this.outline.position.z = toolOverlayZ;
    this.crosshairShiftGroup.add(this.outline);

    this.previewBrushCursor = new PreviewBrushCursor(editor, viewType);
    this.previewBrushCursor.position.z = toolOverlayZ;
    this.crosshairShiftGroup.add(this.previewBrushCursor);

    this.disposers.push(
      autorun(this.updateScale),
      autorun(this.updateOffset),
      autorun(() => {
        this.annotationMesh.visible = Boolean(
          this.editor.activeDocument?.layers[0].isVisible,
        );
        this.editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.imageMesh.visible = Boolean(
          this.editor.activeDocument?.layers[1].isVisible,
        );
        this.editor.sliceRenderer?.lazyRender();
      }),
    );
  }

  public dispose() {
    this.imageMaterial.dispose();
    this.crosshair.dispose();
    this.brushCursor.dispose();
    this.outline.dispose();
    this.disposers.forEach((disposer) => disposer());
  }

  public setImage(image: RenderedImage) {
    this.imageMaterial.setImage(image);

    this.baseSize.copy(
      getGeometrySize(image.voxelCount, image.voxelSpacing, this.viewType),
    );
    this.updateScale();
  }

  public setAnnotation(image?: RenderedImage) {
    if (image) {
      this.annotationMaterial.setImage(image);
      this.annotationMesh.visible = true;
    } else {
      this.annotationMesh.visible = false;
    }

    this.updateScale();
  }

  public setCrosshairSynchOffset(offset = new THREE.Vector2()) {
    this.crosshairSynchOffset.copy(offset);
    this.crosshairShiftGroup.position.set(-offset.x, -offset.y, 0);
  }

  /**
   * Converts a position to virtual uv coordinates of this slice.
   * Virtual means, that uv coordinates can be outside the [0, 1] range aswell.
   */
  public getVirtualUVs(position: THREE.Vector3) {
    const localPosition = this.crosshairShiftGroup
      .worldToLocal(position)
      .addScalar(0.5);

    return {
      x: 1 - localPosition.x,
      y: localPosition.y,
    };
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
