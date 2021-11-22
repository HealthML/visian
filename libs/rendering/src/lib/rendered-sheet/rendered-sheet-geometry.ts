import * as THREE from "three";

export class RenderedSheetGeometry extends THREE.ShapeBufferGeometry {
  public shape: THREE.Shape;

  constructor(radius: number) {
    const width = 1;
    const height = 1;
    const x = -width / 2;
    const y = -height / 2;

    const shape = new THREE.Shape();
    shape.moveTo(x, y + radius);
    shape.lineTo(x, y + height - radius);
    shape.absarc(
      x + radius,
      y + height - radius,
      radius,
      Math.PI,
      0.5 * Math.PI,
      true,
    );
    shape.moveTo(x + radius, y + height);
    shape.lineTo(x + width - radius, y + height);
    shape.absarc(
      x + width - radius,
      y + height - radius,
      radius,
      0.5 * Math.PI,
      0,
      true,
    );
    shape.moveTo(x + width, y + height - radius);
    shape.lineTo(x + width, y + radius);
    shape.absarc(
      x + width - radius,
      y + radius,
      radius,
      0,
      -0.5 * Math.PI,
      true,
    );
    shape.moveTo(x + width - radius, y);
    shape.lineTo(x + radius, y);
    shape.absarc(x + radius, y + radius, radius, -0.5 * Math.PI, Math.PI, true);

    super(shape);

    this.shape = shape;

    (this.attributes.uv as THREE.BufferAttribute).copyArray(
      (this.attributes.uv.array as Array<number>).map((a) => 5 * a),
    );
  }
}
