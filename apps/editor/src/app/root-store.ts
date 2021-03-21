import { LocalForageBackend } from "@visian/ui-shared";
import React from "react";

import { RootStore, Snapshot } from "../models";
import { storePersistInterval } from "./constants";

export const storageBackend = new LocalForageBackend<Snapshot>(
  storePersistInterval,
  "STORE",
);

export const setupRootStore = async () => {
  const store = new RootStore({ storageBackend });
  await store.rehydrate();

  return store;
};

const storeContext = React.createContext<RootStore | null>(null);
export const StoreProvider = storeContext.Provider;
export const useStore = () => React.useContext(storeContext);
