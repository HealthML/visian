import { asyncThrottle, AsyncDebouncedFunc } from "@visian/utils";
import localForage from "localforage";

import { IStorageBackend } from "./types";

let prefixCounter = 0;
const generatePrefix = () => `B${prefixCounter++}`;

const instances: { [key: string]: LocalForage } = {};

export const resolveData = async <T>(data: T | (() => T | Promise<T>)) =>
  typeof data === "function" ? (data as () => T | Promise<T>)() : data;

export class LocalForageBackend<T = unknown> implements IStorageBackend<T> {
  protected instance: LocalForage;
  protected persistors: {
    [key: string]: AsyncDebouncedFunc<
      (data: T | (() => T | Promise<T>)) => Promise<void>
    >;
  } = {};

  /**
   * @constructor
   * @param waitTime The minimum time between writes.
   * @param instanceName The name of the `localForage` instance used by this backend.
   * This should under any circumstances be set manual when you are using multiple
   * `LocalForageBackend`s and the order of their initialization is non-deterministic.
   */
  constructor(
    public readonly waitTime = 1000,
    protected readonly instanceName = generatePrefix(),
  ) {
    let instance = instances[instanceName];
    if (!instance) {
      instance = localForage.createInstance({ name: instanceName });
      instances[instanceName] = instance;
    }
    this.instance = instance;
  }

  public clear() {
    Object.values(this.persistors).forEach((persistor) => {
      persistor.cancel();
    });
    return this.instance.clear();
  }

  public delete(key: string) {
    this.persistors[key]?.cancel();
    return this.instance.removeItem(key);
  }

  public async persist(
    key: string,
    data: T | (() => T | Promise<T>),
    setDirty?: (dirty: boolean) => void,
  ) {
    if (this.waitTime) return this.getPersistor(key, setDirty)(data);
    await this.instance.setItem(key, await resolveData<T>(data));
  }

  public async persistImmediately(
    key: string,
    data: T | (() => T | Promise<T>),
  ) {
    this.persistors[key]?.cancel();

    await this.instance.setItem(key, await resolveData<T>(data));
  }

  public retrieve(key: string): Promise<T | null | undefined> {
    return this.instance.getItem(key);
  }

  protected getPersistor(key: string, setDirty?: (dirty: boolean) => void) {
    let persistor = this.persistors[key];

    if (!persistor) {
      persistor = asyncThrottle(async (data: T | (() => T | Promise<T>)) => {
        this.instance.setItem(key, await resolveData<T>(data));
        if (setDirty) setDirty(false);
      }, this.waitTime);
      this.persistors[key] = persistor;
    }

    return persistor;
  }
}
