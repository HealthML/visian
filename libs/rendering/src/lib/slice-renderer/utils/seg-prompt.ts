import { IEditor, ISAMTool } from "@visian/ui-shared";
import { getPlaneAxes, IDisposable, IDisposer, ViewType } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

enum PointState {
  FOREGROUND = 0,
  BACKGROUND = 1,
}

export class SegPrompt extends THREE.Group implements IDisposable {
  private lines = new THREE.LineLoop();
  private promptPoints = new THREE.Points();

  private disposers: IDisposer[] = [];

  constructor(
    private editor: IEditor,
    private viewType: ViewType,
    lineMaterial: THREE.Material,
    pointMaterial: THREE.Material,
  ) {
    super();

    this.lines.material = lineMaterial;
    this.promptPoints.material = pointMaterial;

    this.position.set(0.5, -0.5, -1);
    this.scale.set(-1, 1, 1);

    this.add(this.lines);
    this.add(this.promptPoints);

    this.disposers.push(autorun(this.updateGeometries));
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.lines.geometry.dispose();
    this.promptPoints.geometry.dispose();
  }

  private updateGeometries = () => {
    const document = this.editor.activeDocument;
    if (!document?.mainImageLayer) return;
    if (document?.viewport2D.mainViewType !== this.viewType) return;

    const tool = document.tools.tools["sam-tool"] as ISAMTool | undefined;
    if (!tool) return;

    const [widthAxis, heightAxis] = getPlaneAxes(this.viewType);
    const { voxelCount } = document.mainImageLayer.image;
    const scale = new THREE.Vector2(
      voxelCount[widthAxis],
      voxelCount[heightAxis],
    );

    this.visible = false; // will be set to true in methods
    this.updateBoundingBox(tool, scale);
    this.updatePoints(tool, scale);

    this.editor.sliceRenderer?.lazyRender();
  };

  private updatePoints(tool: ISAMTool, scale: THREE.Vector2) {
    const points: THREE.Vector2[] = [];
    const pointStates: number[] = [];
    tool.foregroundPoints.forEach((point) => {
      points.push(new THREE.Vector2(point.x, point.y));
      pointStates.push(PointState.FOREGROUND);
    });
    tool.backgroundPoints.forEach((point) => {
      points.push(new THREE.Vector2(point.x, point.y));
      pointStates.push(PointState.BACKGROUND);
    });
    points.forEach((point) => point.addScalar(0.5).divide(scale));

    this.visible = true;
    this.promptPoints.geometry.dispose();
    this.promptPoints.geometry = new THREE.BufferGeometry().setFromPoints(
      points,
    );
    this.promptPoints.geometry.setAttribute(
      "textureIndex",
      new THREE.Float32BufferAttribute(new Float32Array(pointStates), 1),
    );
  }

  private updateBoundingBox(tool: ISAMTool, scale: THREE.Vector2) {
    const linePoints: THREE.Vector2[] = [];

    if (tool.boundingBox) {
      const topLeft = tool.boundingBox.start;
      const bottomRight = tool.boundingBox.end;

      linePoints.push(new THREE.Vector2(topLeft.x, topLeft.y));
      linePoints.push(new THREE.Vector2(bottomRight.x, topLeft.y));
      linePoints.push(new THREE.Vector2(bottomRight.x, bottomRight.y));
      linePoints.push(new THREE.Vector2(topLeft.x, bottomRight.y));
    }

    linePoints.forEach((point) => point.addScalar(0.5).divide(scale));

    this.visible = true;
    this.lines.geometry.dispose();
    this.lines.geometry = new THREE.BufferGeometry().setFromPoints(linePoints);
  }
}
