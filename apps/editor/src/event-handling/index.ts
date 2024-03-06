import { IDispatch } from "@visian/ui-shared";
import { IDisposer } from "@visian/utils";

import { setUpHotKeys } from "./hotkeys";
import { setUpPointerHandling } from "./pointers";
import { setUpWheelHandling } from "./wheel";
import type { RootStore } from "../models";

export const setUpEventHandling = (
  store: RootStore,
): [IDispatch, IDisposer] => {
  const disposeHotkeys = setUpHotKeys(store);
  const disposeWheelHandling = setUpWheelHandling(store);
  const [dispatchPointerHandling, diposePointerHandling] =
    setUpPointerHandling(store);

  return [
    dispatchPointerHandling,
    () => {
      disposeHotkeys();
      disposeWheelHandling();
      diposePointerHandling();
    },
  ];
};
