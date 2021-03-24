import hotkeys from "hotkeys-js";

import type { RootStore } from "../models";

export const setUpHotKeys = (store: RootStore) => {
  hotkeys.filter = () => true;
  hotkeys("ctrl+s", (event) => {
    event.preventDefault();
    store.persistImmediately();
  });
};
