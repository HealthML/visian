import { WHOTask, WHOTaskType, createFileFromBase64 } from "@visian/utils";
import {ReviewTask, TaskType} from "./task";

const taskTypeMapping = {
    [WHOTaskType.Create]: TaskType.Create,
    [WHOTaskType.Correct]: TaskType.Review,
    [WHOTaskType.Review]: TaskType.Supervise,
  };

export class WHOReviewTask implements ReviewTask {
    private _whoTask: WHOTask;
    public get kind():TaskType{
        return taskTypeMapping[this._whoTask.kind];
    }
    public get title():string{
        return this._whoTask.annotationTasks[0].title;
    }
    public get description():string{
        return this._whoTask.annotationTasks[0].description;
    }

    constructor(
      whoTask: WHOTask
    ) {
      this._whoTask = whoTask;
    }
    private getImageFiles(): File[] {
        return this._whoTask.samples.map((sample) => {
          return createFileFromBase64(sample?.title, sample?.data);
        });
      }
    
      private getAnnotationFiles(): Annotation[] {
        const whoAnnotation = this.whoTask?.annotations.find(
          (annotation) => annotation.annotationUUID === annotationId,
        );
        if (!whoAnnotation) throw new Error("WHO Annotation not found");
    
        return whoAnnotation?.data.map((annotationData) =>
          createFileFromBase64(
            title.replace(".nii", "_annotation").concat(".nii"),
            annotationData.data,
          ),
        );
      }
      setAnnotationFiles(Annotation[])
      setAnnotationFile(Annotation)
  }
  