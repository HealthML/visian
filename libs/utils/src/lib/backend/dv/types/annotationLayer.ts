export interface DVAnnotationLayerSnapshot {
  id: string;
  label: string;
  color: string;
}

/**
 * @export
 * @class DVAnnotationLayer
 */
export class DVAnnotationLayer {
  /**
   * @static
   * @param {*} annotationGroup The json object of the annotation group (=VISIAN layer) as received from DV
   * @param {string} userID The user who created this layer
   * @return {*}  {DVAnnotationLayer}
   * @memberof DVAnnotationLayer
   */
  public static createFromImport(
    annotationGroup: any,
    userID: string,
  ): DVAnnotationLayer {
    return new DVAnnotationLayer(
      annotationGroup.id,
      userID,
      annotationGroup.label,
      annotationGroup.color,
      undefined,
    );
  }

  /**
   * Represents an AnnotationLayer object.
   */
  /**
   * Represents an AnnotationLayer object.
   * @param id - The ID of the annotation layer.
   * @param userID - The ID of the user who created the annotation layer.
   * @param label - The label / name of the annotation layer.
   * @param color - The color of the annotation layer.
   * @param visianLayerID - The ID of the corresponding Visian layer (optional).
   */
  constructor(
    public id: string,
    public userID: string,
    public label: string,
    public color: string,
    public visianLayerID: string | undefined,
  ) {
    this.id = id;
    this.userID = userID;
    this.label = label;
    this.color = color;
    this.visianLayerID = visianLayerID;
  }

  public toJSON(): DVAnnotationLayerSnapshot {
    return {
      id: this.id,
      label: this.label,
      color: this.color,
    };
  }
}
