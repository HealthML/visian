import { IEditor, IImageLayer } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";
import { RenderedImage } from "../rendered-image";
import { BoundingBox, CuttingPlane, SharedUniforms } from "./utils";

import { VolumeMaterial } from "./volume-material";

/** A volume domain. */
export class Volume extends THREE.Mesh implements IDisposable {
  private cuttingPlane: CuttingPlane;

  private boundingBox: BoundingBox;

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

    this.resetRotation();

    this.cuttingPlane = new CuttingPlane(editor);
    this.add(this.cuttingPlane);

    this.boundingBox = new BoundingBox(editor);
    this.add(this.boundingBox);

    this.disposers.push(
      autorun(() => {
        const imageLayer = editor.activeDocument?.layers.find(
          (layer) => layer.kind === "image",
        );
        if (!imageLayer) return;

        const image = (imageLayer as IImageLayer).image as RenderedImage;
        const scale = image.voxelCount
          .clone(false)
          .multiply(image.voxelSpacing)
          .multiplyScalar(0.001);

        this.scale.set(scale.x, scale.y, scale.z);
      }),
    );
  }

  public resetRotation() {
    // The coordinate system in medical images usually has the object
    // laying on the side. We want it to be upright.
    this.rotation.set(-Math.PI / 2, 0, 0);
  }

  public dispose() {
    (this.material as VolumeMaterial).dispose();
    this.cuttingPlane.dispose();
    this.boundingBox.dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}
