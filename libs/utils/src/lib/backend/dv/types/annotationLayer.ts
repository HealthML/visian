export interface DVAnnotationGroupSnapshot {
  id: string;
  label: string;
  color: string;
}

export class DVAnnotationLayer {
  public static createFromImport(
    annotation: any,
    layerUserMapping: Map<string, string>,
  ): DVAnnotationLayer {
    return new DVAnnotationLayer(
      annotation.id,
      layerUserMapping.get(annotation.id) ?? "unknown",
      annotation.label,
      annotation.color,
      undefined,
    );
  }

  constructor(
    public annotationID: string,
    public userID: string,
    public label: string,
    public color: string,
    public visianLayerID: string | undefined,
  ) {}

  public toJSON(): DVAnnotationGroupSnapshot {
    return {
      id: this.annotationID,
      label: this.label,
      color: this.color,
    };
  }
}
