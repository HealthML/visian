import { color, IDocument } from "@visian/ui-shared";
import { IDisposable, IDisposer, ViewType } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

import { RenderedImage } from "../rendered-image";
import { sliceFragmentShader, sliceVertexShader } from "../shaders";
import { getOrder } from "./utils";

export abstract class SliceMaterial
  extends THREE.ShaderMaterial
  implements IDisposable {
  protected disposers: IDisposer[] = [];

  private image?: RenderedImage;

  constructor(
    private document: IDocument,
    private viewType: ViewType,
    defines = {},
    uniforms = {},
  ) {
    super({
      defines,
      vertexShader: sliceVertexShader,
      fragmentShader: sliceFragmentShader,
      uniforms: THREE.UniformsUtils.merge([
        {
          uDataTexture: { value: null },
          uActiveSlices: { value: [0, 0, 0] },
          uVoxelCount: { value: [1, 1, 1] },
          uAtlasGrid: { value: [1, 1] },
          uComponents: { value: 1 },
        },
        uniforms,
      ]),
      transparent: true,
      side: THREE.DoubleSide,
    });

    switch (viewType) {
      case ViewType.Transverse:
        this.defines.TRANSVERSE = "";
        break;
      case ViewType.Sagittal:
        this.defines.SAGITTAL = "";
        break;
      case ViewType.Coronal:
        this.defines.CORONAL = "";
        break;
    }

    this.disposers.push(
      autorun(() => {
        this.uniforms.uActiveSlices.value = document.viewSettings.selectedVoxel.toArray();
        document.sliceRenderer?.lazyRender();
      }),
      autorun(this.updateTexture),
    );
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }

  /** Updates the rendered image. */
  public setImage(image: RenderedImage) {
    this.uniforms.uVoxelCount.value = image.voxelCount;
    this.uniforms.uAtlasGrid.value = image.getAtlasGrid();
    this.uniforms.uComponents.value = image.voxelComponents;
    this.image = image;
    this.updateTexture();
  }

  private updateTexture = () => {
    const canvasIndex = getOrder(this.document.viewport2D.mainViewType).indexOf(
      this.viewType,
    );
    this.uniforms.uDataTexture.value = this.image?.getTexture(canvasIndex);
  };
}

export default SliceMaterial;

export class ImageSliceMaterial extends SliceMaterial {
  constructor(document: IDocument, viewType: ViewType) {
    super(
      document,
      viewType,
      { IMAGE: "" },
      {
        uContrast: { value: document.viewSettings.contrast },
        uBrightness: { value: document.viewSettings.brightness },
        uForegroundColor: { value: new THREE.Color("white") },
      },
    );

    this.disposers.push(
      autorun(() => {
        this.uniforms.uContrast.value = document.viewSettings.contrast;
        document.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uBrightness.value = document.viewSettings.brightness;
        document.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        (this.uniforms.uForegroundColor.value as THREE.Color).set(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          color(document.layers[1].color as any)({
            theme: document.editor.theme,
          }),
        );
      }),
    );
  }
}

export class AnnotationSliceMaterial extends SliceMaterial {
  constructor(document: IDocument, viewType: ViewType) {
    super(
      document,
      viewType,
      { ANNOTATION: "" },
      {
        uAnnotationColor: { value: new THREE.Color("red") },
        uAnnotationOpacity: { value: 0.5 },
      },
    );

    this.disposers.push(
      autorun(() => {
        (this.uniforms.uAnnotationColor.value as THREE.Color).set(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          color(document.layers[0].color as any)({
            theme: document.editor.theme,
          }),
        );
        document.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uAnnotationOpacity.value = document.layers[0].opacity;
        document.sliceRenderer?.lazyRender();
      }),
    );
  }
}
