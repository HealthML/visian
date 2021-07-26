import { IEditor, IImageLayer, ILayer } from "@visian/ui-shared";
import { IDisposable, IDisposer, ViewType } from "@visian/utils";
import { autorun, reaction } from "mobx";
import * as THREE from "three";

import { SliceLayer } from "./slice-layer";
import {
  BrushCursor,
  toolOverlayZ,
  Crosshair,
  crosshairZ,
  getGeometrySize,
  Outline,
  PreviewBrushCursor,
  sliceLayerIntervall,
} from "./utils";

export class Slice extends THREE.Group implements IDisposable {
  public readonly baseSize = new THREE.Vector2();

  private workingVector = new THREE.Vector2();

  // Wrapper around every part of the slice.
  // Used to synch the crosshair position when the main view changes.
  private crosshairShiftGroup = new THREE.Group();
  public crosshairSynchOffset = new THREE.Vector2();

  private geometry = new THREE.PlaneGeometry();

  private sliceLayers: SliceLayer[] = [];

  private crosshair: Crosshair;

  public brushCursor: BrushCursor;
  public outline: Outline;

  public previewBrushCursor: PreviewBrushCursor;

  private disposers: IDisposer[] = [];

  constructor(private editor: IEditor, private viewType: ViewType) {
    super();
    this.geometry.scale(-1, 1, 1);

    this.add(this.crosshairShiftGroup);

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
      reaction(
        () => editor.activeDocument?.imageLayers || [],
        this.updateSliceLayers,
        { fireImmediately: true },
      ),
    );
  }

  public dispose() {
    this.crosshair.dispose();
    this.brushCursor.dispose();
    this.outline.dispose();
    this.disposers.forEach((disposer) => disposer());
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

  private updateSliceLayers = (layers: ILayer[]) => {
    // Add new layers.
    layers
      .filter(
        (layer) =>
          !this.sliceLayers.find(
            (sliceLayer) => sliceLayer.layerId === layer.id,
          ),
      )
      .forEach((newLayer) => {
        const sliceLayer = new SliceLayer(
          this.editor,
          this.viewType,
          this.geometry,
          newLayer as IImageLayer,
        );
        this.sliceLayers.push(sliceLayer);
        this.crosshairShiftGroup.add(sliceLayer);
      });

    // Remove old layers.
    this.sliceLayers
      .filter(
        (sliceLayer) =>
          !layers.find((layer) => layer.id === sliceLayer.layerId),
      )
      .forEach((oldSliceLayer) => {
        const sliceLayerIndex = this.sliceLayers.indexOf(oldSliceLayer);
        this.sliceLayers.splice(sliceLayerIndex, 1);
        this.crosshairShiftGroup.remove(oldSliceLayer);
        oldSliceLayer.dispose();
      });

    this.updateSliceLayerOrder();
  };

  private updateSliceLayerOrder() {
    const imageLayers = this.editor.activeDocument?.imageLayers;
    if (!imageLayers) return;

    const [min, max] = sliceLayerIntervall;
    const intervallLength = max - min;

    imageLayers.forEach((imageLayer, index) => {
      const sliceLayer = this.sliceLayers.find(
        (layer) => layer.layerId === imageLayer.id,
      );
      if (!sliceLayer) return;

      sliceLayer.position.z =
        min + (index / (Math.max(2, imageLayers.length) - 1)) * intervallLength;
    });

    this.editor.sliceRenderer?.lazyRender();
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
