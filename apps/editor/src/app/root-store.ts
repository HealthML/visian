import { LocalForageBackend } from "@visian/ui-shared";
import { deepObserve } from "mobx-utils";
import React from "react";

import { RootSnapshot, RootStore } from "../models";
import { storePersistInterval } from "./constants";

export const storageBackend = new LocalForageBackend<RootSnapshot>(
  storePersistInterval,
  "STORE",
);

export const setupRootStore = async () => {
  const previousSnapshot = await storageBackend.retrieve("/");

  const store = new RootStore();
  if (previousSnapshot) store.rehydrate(previousSnapshot);

  deepObserve(store, () => {
    console.log(store.toJSON());
    storageBackend.persist("/", store.toJSON());
  });

  return store;
};

const storeContext = React.createContext<RootStore | null>(null);
export const StoreProvider = storeContext.Provider;
export const useStore = () => React.useContext(storeContext);
