import { color, IEditor, IImageLayer } from "@visian/ui-shared";
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

  constructor(
    private editor: IEditor,
    private viewType: ViewType,
    private imageLayer: IImageLayer,
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

    const image = imageLayer.image as RenderedImage;
    this.uniforms.uVoxelCount.value = image.voxelCount;
    this.uniforms.uAtlasGrid.value = image.getAtlasGrid();
    this.uniforms.uComponents.value = image.voxelComponents;
    this.updateTexture();

    this.disposers.push(
      autorun(() => {
        this.uniforms.uActiveSlices.value = editor.activeDocument?.viewSettings.selectedVoxel.toArray();
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(this.updateTexture),
    );
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }

  private updateTexture = () => {
    if (!this.editor.activeDocument) return;

    const canvasIndex = getOrder(
      this.editor.activeDocument.viewport2D.mainViewType,
    ).indexOf(this.viewType);
    this.uniforms.uDataTexture.value = (this.imageLayer
      .image as RenderedImage).getTexture(canvasIndex);
  };
}

export default SliceMaterial;

export class ImageSliceMaterial extends SliceMaterial {
  constructor(editor: IEditor, viewType: ViewType, imageLayer: IImageLayer) {
    super(
      editor,
      viewType,
      imageLayer,
      { IMAGE: "" },
      {
        uContrast: { value: editor.activeDocument?.viewSettings.contrast },
        uBrightness: { value: editor.activeDocument?.viewSettings.brightness },
        uForegroundColor: { value: new THREE.Color("white") },
        uImageOpacity: { value: 1 },
      },
    );

    this.disposers.push(
      autorun(() => {
        this.uniforms.uContrast.value =
          editor.activeDocument?.viewSettings.contrast;
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uBrightness.value =
          editor.activeDocument?.viewSettings.brightness;
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        (this.uniforms.uForegroundColor.value as THREE.Color).set(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          color((imageLayer.color as any) || "foreground")({
            theme: editor.theme,
          }),
        );
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uImageOpacity.value = imageLayer.opacity;
        editor.sliceRenderer?.lazyRender();
      }),
    );
  }
}

export class AnnotationSliceMaterial extends SliceMaterial {
  constructor(editor: IEditor, viewType: ViewType, imageLayer: IImageLayer) {
    super(
      editor,
      viewType,
      imageLayer,
      { ANNOTATION: "" },
      {
        uAnnotationColor: { value: new THREE.Color("white") },
        uAnnotationOpacity: { value: 0.5 },
        uUseMergeTexture: { value: false },
        uMergeTexture: { value: null },
        uMergeThreshold: { value: 0 },
      },
    );

    this.disposers.push(
      autorun(() => {
        (this.uniforms.uAnnotationColor.value as THREE.Color).set(
          color(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (imageLayer.color as any) || "foreground",
          )({
            theme: editor.theme,
          }),
        );
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uAnnotationOpacity.value = imageLayer.opacity;
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        const useMergeTexture =
          editor.activeDocument?.activeLayer?.id === imageLayer.id;
        this.uniforms.uUseMergeTexture.value = useMergeTexture;

        if (useMergeTexture) {
          const canvasIndex = getOrder(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            editor.activeDocument!.viewport2D.mainViewType,
          ).indexOf(viewType);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.uniforms.uMergeTexture.value = editor.activeDocument!.tools.layerMergeTextures[
            canvasIndex
          ];
        } else {
          this.uniforms.uMergeTexture.value = null;
        }
      }),
      autorun(() => {
        const steps =
          editor.activeDocument?.tools.regionGrowingRenderer3D.steps ?? 0;

        this.uniforms.uMergeThreshold.value = (255 - steps) / 255;
        editor.sliceRenderer?.lazyRender();
      }),
    );
  }
}
