import { action, computed, makeObservable, observable } from "mobx";

import tc from "tinycolor2";

export class Editor {
  public backgroundColor = "#000";

  constructor() {
    makeObservable(this, {
      backgroundColor: observable,
      theme: computed,
      setBackgroundColor: action,
    });
  }

  public get theme(): "dark" | "light" {
    return tc(this.backgroundColor).getBrightness() / 255 > 0.5
      ? "light"
      : "dark";
  }

  public setBackgroundColor(backgroundColor: string) {
    this.backgroundColor = backgroundColor;
  }
}
