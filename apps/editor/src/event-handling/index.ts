import { setUpHotKeys } from "./hotkeys";

import type { RootStore } from "../models";
import { pointerPreset } from "./pointers";

export const setUpEventHandling = (store: RootStore) => {
  setUpHotKeys(store);
  const dispatch = pointerPreset((pointer, data) => {
    // console.log(data.eventType, pointer);
  });

  /* document.addEventListener("pointerdown", (event) => dispatch(event, "0"), {
    passive: false,
  }); */
  document.addEventListener("pointermove", dispatch, { passive: false });
  document.addEventListener("pointerup", dispatch, { passive: false });
};
