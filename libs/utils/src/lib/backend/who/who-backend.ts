import {
  Task,
  TaskAnnotation,
  TaskImage,
  TaskType,
} from "../../models/review-process";
import { SampleWHO, TaskTypeWHO, TaskWHO } from "./models";

function mapTaskTypes(kind: TaskTypeWHO): TaskType {
  switch (kind) {
    case TaskTypeWHO.Create:
      return TaskType.Create;
    case TaskTypeWHO.Correct:
      return TaskType.Review;
    case TaskTypeWHO.Review:
      return TaskType.Supervise;
  }
}

export const whoBackendBaseUrl = "https://annotation.ai4h.net/api/v1";

export const getWHOTask = (taskId: string) =>
  fetch(`${whoBackendBaseUrl}/tasks/${taskId}`).then((data) => {
    if (!data.ok) {
      throw new Error(data.status.toString());
    }
    return data.json();
  });

export const putWHOTask = (taskId: string, task: string) => {
  const options: RequestInit = {
    method: "PUT",
    redirect: "manual",
    headers: {
      "Content-Type": "application/json",
    },
    body: task,
  };
  return fetch(`${whoBackendBaseUrl}/tasks/${taskId}/next`, options).then(
    (data) => {
      if (!data.ok) throw new Error(data.status.toString());
      return data;
    },
  );
};

export const createTaskFromWHO = (whoTask: TaskWHO): Task => {
  const { title } = whoTask.annotationTasks[0];
  const { description } = whoTask.annotationTasks[0];
  const kind = mapTaskTypes(whoTask.kind);
  const images: TaskImage[] = whoTask.samples.map(
    (sample: SampleWHO, index: number) =>
      new TaskImage(
        sample.sampleUUID,
        sample.title,
        whoTask.annotations[index].data.map(
          (annotation) => new TaskAnnotation(annotation.annotationDataUUID),
        ),
      ),
  );

  return new Task(title, description, kind, images);
};

export const getBase64DataForImage = (id: string, whoTask: TaskWHO): string => {
  // TODO: refactor and use stored WHO task in strategy
  const sample = whoTask.samples.find(
    (whoSample) => whoSample.sampleUUID === id,
  );
  if (!sample) throw new Error("No matching sampleUuid");
  return sample.data;
};

export const getBase64DataForAnnotation = (
  id: string,
  sampleId: string,
  whoTask: TaskWHO,
): string => {
  // TODO: refactor and use stored WHO task in strategy
  const index = whoTask.samples.findIndex(
    (whoSample) => whoSample.sampleUUID === sampleId,
  );
  const annotation = whoTask.annotations[index].data.find(
    (whoAnnotation) => whoAnnotation.annotationDataUUID === id,
  );
  if (!annotation) throw new Error("No matching annotationDataUuid");
  return annotation.data;
};
