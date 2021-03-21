import { asyncThrottle } from "@visian/util";
import localForage from "localforage";

import { IStorageBackend } from "./types";

let prefixCounter = 0;
const generatePrefix = () => `B${prefixCounter++}`;

const instances: { [key: string]: LocalForage } = {};

export class LocalForageBackend<T> implements IStorageBackend<T> {
  protected instance: LocalForage;
  protected persistors: {
    [key: string]: (data: T) => Promise<void>;
  } = {};

  /**
   * @constructor
   * @param waitTime The minimum time between writes.
   * @param instanceName The name of the `localForage` instance used by this backend.
   * This should under any circumstances be set manual when you are using multiple
   * `LocalForageBackend`s and the order of their initialization is non-deterministic.
   */
  constructor(
    protected waitTime = 1000,
    protected instanceName = generatePrefix(),
  ) {
    let instance = instances[instanceName];
    if (!instance) {
      instance = localForage.createInstance({ name: instanceName });
      instances[instanceName] = instance;
    }
    this.instance = instance;
  }

  public delete(key: string) {
    return this.instance.removeItem(key);
  }

  public persist(key: string, data: T) {
    let persistor = this.persistors[key];

    if (!persistor) {
      persistor = this.getPersistor(key);
      this.persistors[key] = persistor;
    }

    return persistor(data);
  }

  public retrieve(key: string): Promise<T | null | undefined> {
    return this.instance.getItem(key);
  }

  protected getPersistor(key: string, waitTime = this.waitTime) {
    return waitTime
      ? asyncThrottle((data: T) => this.instance.setItem(key, data), waitTime)
      : async (data: T) => {
          await this.instance.setItem(key, data);
        };
  }
}
