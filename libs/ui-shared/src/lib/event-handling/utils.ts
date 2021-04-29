import { EventLike } from "@visian/ui-shared";

export const preventDefault = (event: EventLike) => {
  event.preventDefault();
};

export const stopPropagation = (event: EventLike) => {
  event.stopPropagation();
};
