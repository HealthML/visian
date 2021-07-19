import * as THREE from "three";

const pickingMaterial = new THREE.MeshBasicMaterial({
  vertexColors: true,
  side: THREE.DoubleSide,
});

export default class AnnotationStructure extends THREE.Mesh {
  public pickingMesh: THREE.Mesh;

  constructor(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    index: number,
  ) {
    super(geometry, material);
    this.userData.index = index;

    const color = new THREE.Color();
    color.setHex(index + 1);

    const pickingGeometry = geometry.clone();
    const { position } = pickingGeometry.attributes;
    const colors = [];

    for (let i = 0; i < position.count; i++) {
      colors.push(color.r, color.g, color.b);
    }

    pickingGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3),
    );

    this.pickingMesh = new THREE.Mesh(pickingGeometry, pickingMaterial);
  }

  public hide = () => {
    this.visible = false;
    this.pickingMesh.visible = false;
  };

  public show = () => {
    this.visible = true;
    this.pickingMesh.visible = true;
  };
}
