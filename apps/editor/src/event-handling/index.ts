import { setUpHotKeys } from "./hotkeys";

import type { RootStore } from "../models";

export const setUpEventHandling = (store: RootStore) => {
  setUpHotKeys(store);
};
