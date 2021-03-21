import { asyncThrottle, AsyncDebouncedFunc } from "@visian/util";
import localForage from "localforage";

import { IStorageBackend } from "./types";

let prefixCounter = 0;
const generatePrefix = () => `B${prefixCounter++}`;

const instances: { [key: string]: LocalForage } = {};

export class LocalForageBackend<T> implements IStorageBackend<T> {
  protected instance: LocalForage;
  protected persistors: {
    [key: string]: AsyncDebouncedFunc<(data: T) => Promise<void>>;
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
    return this.instance.clear();
  }

  public delete(key: string) {
    return this.instance.removeItem(key);
  }

  public async persistImmediately(key: string, data: T) {
    const persistor = this.persistors[key];
    if (persistor) persistor.cancel();

    await this.instance.setItem(key, data);
  }

  public async persist(key: string, data: T) {
    if (this.waitTime) return this.getPersistor(key)(data);
    await this.instance.setItem(key, data);
  }

  public retrieve(key: string): Promise<T | null | undefined> {
    return this.instance.getItem(key);
  }

  protected getPersistor(key: string) {
    let persistor = this.persistors[key];

    if (!persistor) {
      persistor = asyncThrottle(
        (data: T) => this.instance.setItem(key, data),
        this.waitTime,
      );
      this.persistors[key] = persistor;
    }

    return persistor;
  }
}
