import React from "react";

import { RootStore } from "../models";

export const setupRootStore = async () => {
  return new RootStore();
};

const storeContext = React.createContext<RootStore | null>(null);
export const StoreProvider = storeContext.Provider;
export const useStore = () => React.useContext(storeContext);
