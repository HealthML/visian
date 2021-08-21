import { IEditor } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

import { RenderedImage } from "../rendered-image";
import {
  BoundingBox,
  ClippingPlane,
  RaycastingCone,
  SharedUniforms,
} from "./utils";
import { VolumeMaterial, VolumePickingMaterial } from "./volume-material";

/** A volume domain. */
export class Volume extends THREE.Mesh implements IDisposable {
  public clippingPlane: ClippingPlane;

  private boundingBox: BoundingBox;

  public raycastingCone: RaycastingCone;

  public mainMaterial: VolumeMaterial;
  public pickingMaterial: VolumePickingMaterial;

  private disposers: IDisposer[] = [];
  constructor(
    editor: IEditor,
    sharedUniforms: SharedUniforms,
    firstDerivative: THREE.Texture,
    secondDerivative: THREE.Texture,
    outputDerivative: THREE.Texture,
    lao: THREE.Texture,
  ) {
    super(
      new THREE.BoxGeometry(1, 1, 1),
      new VolumeMaterial(
        editor,
        sharedUniforms,
        firstDerivative,
        secondDerivative,
        outputDerivative,
        lao,
      ),
    );

    this.mainMaterial = this.material as VolumeMaterial;
    this.pickingMaterial = new VolumePickingMaterial(
      editor,
      sharedUniforms,
      firstDerivative,
      secondDerivative,
      outputDerivative,
      lao,
    );

    this.resetRotation();

    this.renderOrder = 1;

    this.clippingPlane = new ClippingPlane(editor, sharedUniforms);
    this.add(this.clippingPlane);

    this.boundingBox = new BoundingBox(editor);
    this.add(this.boundingBox);

    this.raycastingCone = new RaycastingCone(editor);
    this.add(this.raycastingCone);

    this.disposers.push(
      autorun(() => {
        const imageLayer = editor.activeDocument?.baseImageLayer;
        if (!imageLayer) return;

        const image = imageLayer.image as RenderedImage;
        const scale = image.voxelCount
          .clone(false)
          .multiply(image.voxelSpacing)
          .multiplyScalar(0.001);

        this.scale.set(scale.x, scale.y, scale.z);

        // The camera position has to be converted to the new volume coordinate system.
        editor.volumeRenderer?.updateCameraPosition();
        editor.volumeRenderer?.lazyRender();
      }),
    );
  }

  public resetRotation() {
    // The coordinate system in medical images usually has the object
    // laying on the side. We want it to be upright.
    this.rotation.set(-Math.PI / 2, 0, 0);
  }

  public onBeforePicking() {
    this.material = this.pickingMaterial;
    this.remove(this.boundingBox, this.raycastingCone);

    this.clippingPlane.onBeforePicking();
  }

  public onAfterPicking() {
    this.material = this.mainMaterial;
    this.add(this.boundingBox, this.raycastingCone);

    this.clippingPlane.onAfterPicking();
  }

  public dispose() {
    this.mainMaterial.dispose();
    this.pickingMaterial.dispose();
    this.clippingPlane.dispose();
    this.boundingBox.dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}
