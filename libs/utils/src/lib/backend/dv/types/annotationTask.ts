import { DVAnnotationLayer } from "./annotationLayer";
import { DVCase } from "./case";
import { DVRoi } from "./roi";
import { DVScan } from "./scan";
import { DVSlice } from "./slice";

export interface DVAnnotationTaskSnapshot {
  taskID: string;
  userID: string;
  dvCase: any;
  scan: any;
  annotationGroups: any[];
  rois: any[];
}

export class DVAnnotationTask {
  /**
   * Creates a DVAnnotationTask object from the imported JSON object.
   * AnnotationGroups in DV are Annotation Layers in Visian.
   * It creates a mapping of the layers to the users who created them.
   * The layers are then grouped by user to form VISIAN annotation groups.
   *
   * @param jsonObject - The JSON object containing the data for the annotation task.
   * @returns A DVAnnotationTask object created from the JSON data.
   */
  public static createFromImport(jsonObject: any): DVAnnotationTask {
    const { taskID, userID } = jsonObject;
    const dvCase = new DVCase(jsonObject.case.id);
    const scan = new DVScan(jsonObject.scan);
    const rois = this.parseRois(jsonObject.rois);
    const layerUserMapping = this.getLayerUserMapping(rois);
    // Annotation Groups in DV are Layers in Visian
    // Each user becomes one AnnotationGroup in Visian
    const annotationLayers = this.parseAnnotationLayers(
      jsonObject.annotationGroups,
      layerUserMapping,
    );

    return new DVAnnotationTask(
      taskID,
      userID,
      dvCase,
      scan,
      annotationLayers,
      rois,
    );
  }

  /**
   * Returns a mapping of annotation layer IDs to users.
   * @param rois - The list of DVRois.
   * @returns The layer user mapping.
   */
  private static getLayerUserMapping(rois: DVRoi[]): Map<string, string> {
    const layerUserMapping = new Map<string, string>();
    rois.forEach((roi) => {
      layerUserMapping.set(roi.layerID, roi.userID);
    });

    return layerUserMapping;
  }

  /**
   * Parses the annotation layers from the provided JSON and returns an array of DVAnnotationLayer objects.
   *
   * @param annotationLayersJson - The JSON representation of the annotation layers.
   * @param layerUserMapping - A map that maps layer IDs to user names. This is needed to group the layers by user later on.
   * @returns An array of DVAnnotationLayer objects.
   */
  private static parseAnnotationLayers(
    annotationLayersJson: any,
    layerUserMapping: Map<string, string>,
  ): DVAnnotationLayer[] {
    return annotationLayersJson.map((layerJson: any) => {
      const user = layerUserMapping.get(layerJson.id) ?? "unknown";
      return DVAnnotationLayer.createFromImport(layerJson, user);
    });
  }

  /**
   * Parses the given JSON representation of ROIs and returns an array of DVRoi objects.
   * @param roisJson - The JSON representation of ROIs.
   * @returns An array of DVRoi objects.
   */
  private static parseRois(roisJson: any): DVRoi[] {
    return roisJson.map((roiJson: any) => DVRoi.createFromImport(roiJson));
  }

  /**
   * Represents an AnnotationTask object.
   * @param taskID - The ID of the task.
   * @param userID - The ID of the user who is currently logged in.
   * @param dvCase - The DVCase object.
   * @param scan - The DVScan object (image).
   * @param annotationLayers - The array of DVAnnotationLayer objects.
   * @param rois - The array of DVRoi objects.
   */
  constructor(
    public taskID: string,
    public userID: string,
    public dvCase: DVCase,
    public scan: DVScan,
    public annotationLayers: DVAnnotationLayer[],
    public rois: DVRoi[],
  ) {
    this.taskID = taskID;
    this.userID = userID;
    this.dvCase = dvCase;
    this.scan = scan;
    this.annotationLayers = annotationLayers;
    this.rois = rois;
  }

  /**
   * Adds the regions of interests (ROIs) to their corresponding slices.
   * Each ROI is assigned to a slice based on its annotation layer ID and z-coordinate.
   * If a matching slice does not exist, a new slice is created.
   * @returns An array of DVSlice objects representing the updated slices.
   */
  public addRoisToCorrespondingSlices(): DVSlice[] {
    const slices = [] as DVSlice[];
    this.rois.forEach((roi) => {
      let slice = roi.findMatchingSlice(slices);
      if (!slice) {
        slice = new DVSlice(roi.layerID, roi.z, [roi]);
        slices.push(slice);
      } else {
        slice.addRoi(roi);
      }
    });
    return slices;
  }

  public getNextAnnotationLayerID(): string {
    const maxID = Math.max(...this.annotationLayers.map((m) => parseInt(m.id)));
    return (maxID + 1).toString();
  }

  public toJSON(): DVAnnotationTaskSnapshot {
    return {
      taskID: this.taskID,
      userID: this.userID,
      dvCase: this.dvCase.toJSON(),
      scan: this.scan.toJSON(),
      annotationGroups: this.annotationLayers.map((group) => group.toJSON()),
      rois: this.rois.map((roi) => roi.toJSON()),
    };
  }
}
