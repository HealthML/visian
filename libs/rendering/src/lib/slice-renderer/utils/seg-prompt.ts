import { IEditor, ISAMTool } from "@visian/ui-shared";
import { getPlaneAxes, IDisposable, IDisposer, ViewType } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

export class SegPrompt extends THREE.Group implements IDisposable {
  private lines = new THREE.LineLoop();

  private disposers: IDisposer[] = [];

  constructor(
    private editor: IEditor,
    private viewType: ViewType,
    lineMaterial: THREE.Material,
  ) {
    super();

    this.lines.material = lineMaterial;

    this.position.set(0.5, -0.5, -1);
    this.scale.set(-1, 1, 1);

    this.add(this.lines);

    this.disposers.push(autorun(this.updateGeometries));
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.lines.geometry.dispose();
  }

  private updateGeometries = () => {
    if (!this.editor.activeDocument?.mainImageLayer) return;

    if (this.editor.activeDocument?.viewport2D.mainViewType !== this.viewType)
      return;

    const boundingBox = (
      this.editor.activeDocument.tools.tools["sam-tool"] as ISAMTool | undefined
    )?.boundingBox;

    if (!boundingBox) {
      this.visible = false;
      this.editor.sliceRenderer?.lazyRender();
      return;
    }
    this.visible = true;

    const [widthAxis, heightAxis] = getPlaneAxes(this.viewType);

    const topLeft = boundingBox.start;
    const bottomRight = boundingBox.end;

    const linePoints: THREE.Vector2[] = [
      new THREE.Vector2(topLeft.x, topLeft.y),
      new THREE.Vector2(bottomRight.x, topLeft.y),
      new THREE.Vector2(bottomRight.x, bottomRight.y),
      new THREE.Vector2(topLeft.x, bottomRight.y),
    ];

    const { voxelCount } = this.editor.activeDocument.mainImageLayer.image;
    const scale = new THREE.Vector2(
      voxelCount[widthAxis],
      voxelCount[heightAxis],
    );
    linePoints.forEach((point) => point.addScalar(0.5).divide(scale));

    this.lines.geometry.dispose();
    this.lines.geometry = new THREE.BufferGeometry().setFromPoints(linePoints);

    this.editor.sliceRenderer?.lazyRender();
  };
}
