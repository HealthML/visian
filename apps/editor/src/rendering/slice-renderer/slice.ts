import { IDisposable, IDisposer, Image, Vector, ViewType } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

import {
  AnnotationSliceMaterial,
  ImageSliceMaterial,
  SliceMaterial,
} from "./slice-material";
import {
  annotationMeshZ,
  Crosshair,
  crosshairZ,
  getGeometrySize,
  imageMeshZ,
} from "./utils";

import type { Editor } from "../../models";

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

  private disposers: IDisposer[] = [];

  constructor(
    private editor: Editor,
    private viewType: ViewType,
    private render: () => void,
  ) {
    super();

    this.add(this.crosshairShiftGroup);

    this.imageMaterial = new ImageSliceMaterial(editor, viewType, render);
    this.imageMesh = new THREE.Mesh(this.geometry, this.imageMaterial);
    this.imageMesh.position.z = imageMeshZ;
    this.imageMesh.userData = {
      viewType,
    };
    this.crosshairShiftGroup.add(this.imageMesh);

    this.annotationMaterial = new AnnotationSliceMaterial(
      editor,
      viewType,
      render,
    );
    this.annotationMesh = new THREE.Mesh(
      this.geometry,
      this.annotationMaterial,
    );
    this.annotationMesh.position.z = annotationMeshZ;
    this.crosshairShiftGroup.add(this.annotationMesh);

    this.crosshair = new Crosshair(this.viewType, this.editor);
    this.crosshair.position.z = crosshairZ;
    this.crosshairShiftGroup.add(this.crosshair);

    this.disposers.push(autorun(this.updateScale), autorun(this.updateOffset));
  }

  public dispose() {
    this.imageMaterial.dispose();
    this.crosshair.dispose();
    this.disposers.forEach((disposer) => disposer());
  }

  public setImage(image: Image) {
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

  public setAnnotation(image?: Image) {
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

    this.render();
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

    this.render();
  };
}
