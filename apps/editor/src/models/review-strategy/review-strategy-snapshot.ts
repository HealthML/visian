import { MiaImage } from "@visian/utils";

import { MiaReviewTaskSnapshot } from "./mia-review-task";
import { TaskType } from "./review-task";
import { WhoReviewTaskSnapshot } from "./who-review-task";
import { DVReviewTaskSnapshot } from "./dv-review-task";

export interface MiaReviewStrategySnapshot {
  backend: "mia";
  images: MiaImage[];
  jobId?: string;
  allowedAnnotations?: string[];
  taskType?: TaskType;
  currentReviewTask?: MiaReviewTaskSnapshot;
}

export interface WHOReviewStrategySnapshot {
  backend: "who";
  currentReviewTask?: WhoReviewTaskSnapshot;
}

export interface DVReviewStrategySnapshot {
  backend: "dv";
  currentReviewTask?: DVReviewTaskSnapshot;
}

export type ReviewStrategySnapshot =
  | MiaReviewStrategySnapshot
  | WHOReviewStrategySnapshot
  | DVReviewStrategySnapshot;
