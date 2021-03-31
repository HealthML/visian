/**
 * @file
 * @see https://github.com/mobxjs/mobx-utils/blob/master/src/deepObserve.ts
 */
import {
  entries,
  IArrayDidChange,
  IMapDidChange,
  IObjectDidChange,
  isObservableArray,
  isObservableMap,
  isObservableObject,
  observe,
  values,
} from "mobx";

import { IDisposer } from "../types";

type IChange = IObjectDidChange | IArrayDidChange | IMapDidChange;

interface Entry {
  dispose: IDisposer;
  path: string;
  parent: Entry | undefined;
}

export interface DeepObserveConfig {
  /**
   * Paths to make deeply observable.
   * If any are given, all others will be ignored.
   */
  include?: string[];

  /**
   * Paths to not make deeply observable.
   * If a path is explicitly included and excluded, it will be excluded as well.
   */
  exclude?: string[];
}

/** Returns a composed path for the given entry. */
const buildPath = (entry: Entry | undefined) => {
  if (!entry) return "/";

  const res: string[] = [];
  while (entry.parent) {
    res.push(entry.path);
    entry = entry.parent;
  }
  res.push("");

  return res.reverse().join("/");
};

/** Returns `true` for `thing`s that might be observable at deeper levels.  */
const isRecursivelyObservable = (thing: unknown) =>
  isObservableObject(thing) ||
  isObservableArray(thing) ||
  isObservableMap(thing);

/**
 * Given an object, deeply observes the given object.
 * It is like `observe` from mobx, but applied recursively, including all future children.
 *
 * Note that the given object cannot ever contain cycles and should be a tree.
 *
 * As benefit: path and root will be provided in the callback, so the signature of the listener is
 * (change, path, root) => void
 *
 * The returned disposer can be invoked to clean up the listener
 *
 * deepObserve cannot be used on computed values.
 *
 * @example
 * const disposer = deepObserve(target, (change, path) => {
 *    console.dir(change)
 * })
 */
export const deepObserve = <T>(
  target: T,
  listener: (change: IChange, path: string, root: T) => void,
  // TODO: Infer paths to track based on this snapshot
  config: DeepObserveConfig = {},
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entrySet = new WeakMap<any, Entry>();

  const processChange = (change: IChange, parent: Entry) => {
    switch (change.type) {
      // Object changes
      case "add": // also for map
        observeRecursively(change.newValue, parent, change.name);
        break;
      case "update": // also for array and map
        unobserveRecursively(change.oldValue);
        observeRecursively(
          change.newValue,
          parent,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (change as any).name || "" + (change as any).index,
        );
        break;
      case "remove": // object
      case "delete": // map
        unobserveRecursively(change.oldValue);
        break;
      // Array changes
      case "splice":
        change.removed.map(unobserveRecursively);
        change.added.forEach((value, idx) =>
          observeRecursively(value, parent, "" + (change.index + idx)),
        );
        // update paths
        for (
          let i = change.index + change.addedCount;
          i < change.object.length;
          i++
        ) {
          if (isRecursivelyObservable(change.object[i])) {
            const entry = entrySet.get(change.object[i]);
            if (entry) entry.path = "" + i;
          }
        }
        break;
    }
  };

  const genericListener = (change: IChange) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const entry = entrySet.get(change.object)!;
    processChange(change, entry);
    listener(change, buildPath(entry), target);
  };

  const observeRecursively = (
    thing: unknown,
    parent: Entry | undefined,
    path: string,
  ) => {
    if (isRecursivelyObservable(thing)) {
      const entry = entrySet.get(thing);
      if (entry) {
        if (entry.parent !== parent || entry.path !== path)
          // MWE: this constraint is artificial, and this tool could be made to work with cycles,
          // but it increases administration complexity, has tricky edge cases and the meaning of 'path'
          // would become less clear. So doesn't seem to be needed for now
          throw new Error(
            `The same observable object cannot appear twice in the same tree,` +
              ` trying to assign it to '${buildPath(parent)}/${path}',` +
              ` but it already exists at '${buildPath(entry.parent)}/${
                entry.path
              }'`,
          );
      } else {
        const entry = {
          parent,
          path,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dispose: observe(thing as any, genericListener),
        };
        entrySet.set(thing, entry);
        entries(thing).forEach(([key, value]) => {
          let childPath: string | undefined;
          if (config.include || config.exclude) {
            childPath = `${buildPath(entry)}/${key}`;
          }
          if (
            (config.include &&
              !~config.include.findIndex((included) =>
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                childPath!.startsWith(included),
              )) ||
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (config.exclude && ~config.exclude.indexOf(childPath!))
          ) {
            return;
          }

          observeRecursively(value, entry, key);
        });
      }
    }
  };

  const unobserveRecursively = (thing: unknown) => {
    if (isRecursivelyObservable(thing)) {
      const entry = entrySet.get(thing);
      if (!entry) return;
      entrySet.delete(thing);
      entry.dispose();
      values(thing).forEach(unobserveRecursively);
    }
  };

  observeRecursively(target, undefined, "");

  return () => {
    unobserveRecursively(target);
  };
};
