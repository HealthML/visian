import { getOrthogonalAxis, Vector } from "@visian/utils";

import { Editor } from "../models";
import { replaceMerge } from "./merging";
import { AnnotationVoxel } from "./types";

export class Annotator {
  private strokeActive = false;

  private sliceNumber?: number;
  private oldSliceData?: Uint8Array;

  constructor(
    protected editor: Editor,
    protected render: () => void,
    private undoable: boolean,
  ) {}

  protected finishStroke(annotation = this.editor.annotation) {
    if (this.undoable) {
      this.strokeActive = false;

      // TODO: undo redo

      this.oldSliceData = undefined;
      this.sliceNumber = undefined;
    }

    annotation?.updateData();
  }

  protected annotate(
    annotations: AnnotationVoxel[],
    viewType = this.editor.viewSettings.mainViewType,
    merge = replaceMerge,
    annotation = this.editor.annotation,
  ) {
    if (!annotation || !annotations.length) return;

    if (this.undoable && !this.strokeActive) {
      this.strokeActive = true;
      this.sliceNumber = annotations[0][getOrthogonalAxis(viewType)];
      this.oldSliceData = annotation.getSlice(this.sliceNumber, viewType);
    }

    annotations.forEach((annotationVoxel) =>
      this.annotateVoxel(annotationVoxel, merge),
    );

    this.render();
  }

  private annotateVoxel(
    annotationVoxel: AnnotationVoxel,
    merge = replaceMerge,
    annotation = this.editor.annotation,
  ) {
    if (
      !annotation ||
      annotationVoxel.x < 0 ||
      annotationVoxel.y < 0 ||
      annotationVoxel.z < 0 ||
      annotationVoxel.x >= annotation.voxelCount.x ||
      annotationVoxel.y >= annotation.voxelCount.y ||
      annotationVoxel.z >= annotation.voxelCount.z
    ) {
      return;
    }

    const coordinates = Vector.fromObject(annotationVoxel, false);

    const oldAnnotationVoxel = AnnotationVoxel.fromVoxelAndValue(
      annotationVoxel,
      annotation.getVoxelData(coordinates),
    );

    const newAnnotationVoxel = merge(annotationVoxel, oldAnnotationVoxel);

    annotation.setAtlasVoxel(coordinates, newAnnotationVoxel.value);
  }
}

export default Annotator;
