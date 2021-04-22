import { IDisposable, IDisposer, Vector, ViewType } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

import {
  AnnotationSliceMaterial,
  ImageSliceMaterial,
  SliceMaterial,
} from "./slice-material";
import {
  annotationMeshZ,
  BrushCursor,
  brushCursorZ,
  Crosshair,
  crosshairZ,
  getGeometrySize,
  imageMeshZ,
} from "./utils";

import type { Editor, RenderedImage } from "../../models";
export class Slice extends THREE.Group implements IDisposable {
  private baseSize = new THREE.Vector2();

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

  private disposers: IDisposer[] = [];

  constructor(private editor: Editor, private viewType: ViewType) {
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

    this.crosshair = new Crosshair(this.viewType, this.editor);
    this.crosshair.position.z = crosshairZ;
    this.crosshairShiftGroup.add(this.crosshair);

    this.brushCursor = new BrushCursor(editor, viewType);
    this.brushCursor.position.z = brushCursorZ;
    this.crosshairShiftGroup.add(this.brushCursor);

    this.disposers.push(
      autorun(this.updateScale),
      autorun(this.updateOffset),
      autorun(() => {
        this.annotationMesh.visible = this.editor.isAnnotationVisible;
        this.editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.imageMesh.visible = this.editor.isImageVisible;
        this.editor.sliceRenderer?.lazyRender();
      }),
    );
  }

  public dispose() {
    this.imageMaterial.dispose();
    this.crosshair.dispose();
    this.brushCursor.dispose();
    this.disposers.forEach((disposer) => disposer());
  }

  public setImage(image: RenderedImage) {
    this.imageMaterial.setImage(image);

    this.baseSize.copy(
      // TODO: Rework once the texture atlas has been refactored
      getGeometrySize(
        Vector.fromArray(image.voxelCount.toArray()),
        Vector.fromArray(image.voxelSpacing.toArray()),
        this.viewType,
      ),
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

  private updateScale = () => {
    this.workingVector.copy(this.baseSize);

    if (this.viewType === this.editor.viewSettings.mainViewType) {
      this.workingVector.multiplyScalar(this.editor.viewSettings.zoomLevel);
    }

    this.scale.set(this.workingVector.x, this.workingVector.y, 1);

    this.editor.sliceRenderer?.lazyRender();
  };

  private updateOffset = () => {
    this.workingVector.multiplyScalar(0);

    if (this.viewType === this.editor.viewSettings.mainViewType) {
      this.workingVector.set(
        this.editor.viewSettings.offset.x,
        this.editor.viewSettings.offset.y,
      );
    }

    this.position.set(this.workingVector.x, this.workingVector.y, 0);

    this.editor.sliceRenderer?.lazyRender();
  };
}
