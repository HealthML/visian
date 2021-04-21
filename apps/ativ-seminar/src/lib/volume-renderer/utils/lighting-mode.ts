export enum LightingModeType {
  None = 0,
  Phong = 1,
  LAO = 2,
}

export const lightingModeTypes = [
  LightingModeType.None,
  LightingModeType.Phong,
  LightingModeType.LAO,
];

export interface ILightingModeProps {
  needsNormals: boolean;
  needsLAO: boolean;
}

export const lightingModeProps: ILightingModeProps[] = [
  {
    needsNormals: false,
    needsLAO: false,
  },
  {
    needsNormals: true,
    needsLAO: false,
  },
  {
    needsNormals: false,
    needsLAO: true,
  },
];

export class LightingMode implements ILightingModeProps {
  public needsNormals: boolean;
  public needsLAO: boolean;

  constructor(public type: LightingModeType) {
    const props = lightingModeProps[type];
    this.needsNormals = props.needsNormals;
    this.needsLAO = props.needsLAO;
  }
}

export const lightingModes = lightingModeTypes.map(
  (type) => new LightingMode(type),
);
