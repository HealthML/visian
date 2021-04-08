import { getOrthogonalAxis, Vector } from "@visian/utils";

import { Editor } from "../editor";
import { SliceUndoRedoCommand } from "../undo-redo";
import { replaceMerge } from "./merging";
import { AnnotationVoxel } from "./types";

/**
 * The Annotator handles editing an annotation (or image).
 *
 * If necessary it creates undo redo commands for the edits.
 */
export class Annotator {
  private strokeActive = false;

  private sliceNumber?: number;
  private oldSliceData?: Uint8Array;

  constructor(protected editor: Editor, private undoable: boolean) {}

  protected finishStroke(
    annotation = this.editor.annotation,
    viewType = this.editor.viewSettings.mainViewType,
  ) {
    if (this.undoable) {
      this.strokeActive = false;

      if (annotation && this.sliceNumber !== undefined) {
        this.editor.undoRedo.addCommand(
          new SliceUndoRedoCommand(
            annotation,
            viewType,
            this.sliceNumber,
            this.oldSliceData,
            annotation.getSlice(this.sliceNumber, viewType),
          ),
        );
      }

      this.oldSliceData = undefined;
      this.sliceNumber = undefined;
    }

    // TODO: Only update image data on finished stroke?
  }

  protected annotate(
    annotations: AnnotationVoxel[],
    viewType = this.editor.viewSettings.mainViewType,
    merge = replaceMerge,
    image = this.editor.annotation,
  ) {
    if (!image || !annotations.length) return;

    if (this.undoable && !this.strokeActive) {
      this.strokeActive = true;
      this.sliceNumber = annotations[0][getOrthogonalAxis(viewType)];
      this.oldSliceData = image.getSlice(this.sliceNumber, viewType);
    }

    annotations.forEach((annotationVoxel) =>
      this.annotateVoxel(annotationVoxel, merge),
    );

    this.editor.sliceRenderer?.lazyRender();
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
