import { MiaImage } from "@visian/utils";

import { MiaReviewTaskSnapshot } from "./mia-review-task";
import { TaskType } from "./review-task";
import { WhoReviewTaskSnapshot } from "./who-review-task";

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

export type ReviewStrategySnapshot =
  | MiaReviewStrategySnapshot
  | WHOReviewStrategySnapshot;
