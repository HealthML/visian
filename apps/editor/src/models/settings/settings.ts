import {
  ColorMode,
  PerformanceMode,
  SupportedLanguage,
} from "@visian/ui-shared";
import { VoxelInfoMode } from "@visian/utils";
import { action, makeObservable, observable } from "mobx";

export class Settings {
  public colorMode: ColorMode = "dark";
  public language: SupportedLanguage = "en";
  public useExclusiveSegmentations = false;
  public voxelInfoMode: VoxelInfoMode = "off";
  public performanceMode: PerformanceMode = "low";

  constructor() {
    makeObservable<this>(this, {
      colorMode: observable,
      language: observable,
      useExclusiveSegmentations: observable,
      voxelInfoMode: observable,
      performanceMode: observable,

      setColorMode: action,
      setLanguage: action,
      setUseExclusiveSegmentations: action,
      setVoxelInfoMode: action,
      setPerformanceMode: action,
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

  public setUseExclusiveSegmentations(exclusiveSegmentations: boolean) {
    this.useExclusiveSegmentations = exclusiveSegmentations;
    this.persist();
  }

  public setVoxelInfoMode(voxelInfoMode: VoxelInfoMode) {
    this.voxelInfoMode = voxelInfoMode;
    this.persist();
  }

  public setPerformanceMode(performanceMode: PerformanceMode) {
    this.performanceMode = performanceMode;
    this.persist();
  }

  public persist() {
    localStorage.setItem("settings.colorMode", this.colorMode);
    localStorage.setItem("settings.language", this.language);
    localStorage.setItem(
      "settings.useExclusiveSegmentations",
      this.useExclusiveSegmentations ? "1" : "0",
    );
    localStorage.setItem("settings.voxelInfoMode", this.voxelInfoMode);
    localStorage.setItem("settings.performanceMode", this.performanceMode);
  }

  public load() {
    const colorMode = (localStorage.getItem("settings.colorMode") ||
      "dark") as ColorMode;
    const language = (localStorage.getItem("settings.language") ||
      "en") as SupportedLanguage;
    const useExclusiveSegmentations = (localStorage.getItem(
      "settings.useExclusiveSegmentations",
    ) || false) as boolean;
    const voxelInfoMode = (localStorage.getItem("settings.voxelInfoMode") ||
      "off") as VoxelInfoMode;
    const performanceMode = (localStorage.getItem("settings.performanceMode") ||
      "low") as PerformanceMode;

    this.setColorMode(colorMode);
    this.setLanguage(language);
    this.setUseExclusiveSegmentations(useExclusiveSegmentations);
    this.setVoxelInfoMode(voxelInfoMode);
    this.setPerformanceMode(performanceMode);
  }
}
