import { EventLike } from "@visian/ui-shared";

export const preventDefault = (event: EventLike) => {
  event.preventDefault();
};
