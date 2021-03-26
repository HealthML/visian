import { setUpHotKeys } from "./hotkeys";

import type { RootStore } from "../models";
import {
  globalListenerTypes,
  pointerPreset,
  registerDispatch,
} from "./pointers";

export const setUpEventHandling = (store: RootStore) => {
  setUpHotKeys(store);
  const dispatch = pointerPreset((pointer, data) => {
    // console.log(data.eventType, pointer);
  });

  /* document.addEventListener("pointerdown", (event) => dispatch(event, "0"), {
    passive: false,
  }); */
  registerDispatch(dispatch, globalListenerTypes);
};
