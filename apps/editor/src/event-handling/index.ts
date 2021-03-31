import { IDispatch } from "@visian/ui-shared";
import { IDisposer } from "@visian/utils";

import { setUpHotKeys } from "./hotkeys";
import { setUpPointerHandling } from "./pointers";

import type { RootStore } from "../models";
import { setUpWheelHandling } from "./wheel";

export const setUpEventHandling = (
  store: RootStore,
): [IDispatch, IDisposer] => {
  setUpHotKeys(store);
  setUpWheelHandling(store);
  return setUpPointerHandling(store);
};
