import { ColorMode, SupportedLanguage } from "@visian/ui-shared";
import { action, makeObservable, observable } from "mobx";

export class Settings {
  public colorMode: ColorMode = "dark";
  public language: SupportedLanguage = "en";

  constructor() {
    makeObservable<this>(this, {
      colorMode: observable,
      language: observable,

      setColorMode: action,
      setLanguage: action,
    });
  }

  public setColorMode(colorMode: ColorMode) {
    this.colorMode = colorMode;
    this.persist();
  }

  public setLanguage(lang: SupportedLanguage) {
    this.language = lang;
    this.persist();
  }

  public persist() {
    localStorage.setItem("settings.colorMode", this.colorMode);
    localStorage.setItem("settings.language", this.language);
  }

  public load() {
    const colorMode = (localStorage.getItem("settings.colorMode") ||
      "dark") as ColorMode;
    const language = (localStorage.getItem("settings.language") ||
      "en") as SupportedLanguage;

    this.colorMode = colorMode;
    this.language = language;
  }
}
