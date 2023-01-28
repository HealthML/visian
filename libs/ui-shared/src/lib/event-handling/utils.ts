import { EventLike } from "./pointers";

export const preventDefault = (event: EventLike) => {
  event.preventDefault();
};

export const stopPropagation = (event: EventLike) => {
  event.stopPropagation();
};
