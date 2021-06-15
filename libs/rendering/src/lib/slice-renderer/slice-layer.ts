import { IEditor, IImageLayer } from "@visian/ui-shared";
import { IDisposable, ViewType } from "@visian/utils";
import { autorun, IReactionDisposer, reaction } from "mobx";
import * as THREE from "three";
import { AnnotationSliceMaterial, ImageSliceMaterial } from "./slice-material";

export class SliceLayer extends THREE.Mesh implements IDisposable {
  protected disposers: IReactionDisposer[] = [];

  constructor(
    protected editor: IEditor,
    viewType: ViewType,
    geometry: THREE.BufferGeometry,
    protected layer: IImageLayer,
  ) {
    super(
      geometry,
      layer.isAnnotation
        ? new AnnotationSliceMaterial(editor, viewType, layer)
        : new ImageSliceMaterial(editor, viewType, layer),
    );

    this.disposers.push(
      reaction(
        () => layer.isAnnotation,
        (isAnnotation) => {
          const oldMaterial = this.material;

          this.material = isAnnotation
            ? new AnnotationSliceMaterial(editor, viewType, layer)
            : new ImageSliceMaterial(editor, viewType, layer);

          (oldMaterial as IDisposable).dispose();

          editor.sliceRenderer?.lazyRender();
        },
      ),
      autorun(() => {
        this.visible = layer.isVisible;

        editor.sliceRenderer?.lazyRender();
      }),
    );
  }

  public dispose() {
    (this.material as IDisposable).dispose();
  }

  public get layerId() {
    return this.layer.id;
  }
}
