import {
  ColorMode,
  PerformanceMode,
  SupportedLanguage,
} from "@visian/ui-shared";
import { VoxelInfoMode } from "@visian/utils";
import { action, makeObservable, observable } from "mobx";

type SettingKey = keyof typeof defaultValues;

const defaultValues: {
  colorMode: ColorMode;
  language: SupportedLanguage;
  useExclusiveSegmentations: boolean;
  voxelInfoMode: VoxelInfoMode;
  performanceMode: PerformanceMode;
} = {
  colorMode: "dark",
  language: "en",
  useExclusiveSegmentations: false,
  voxelInfoMode: "off",
  performanceMode: "low",
};

export class Settings {
  public colorMode: ColorMode = defaultValues.colorMode;
  public language: SupportedLanguage = defaultValues.language;
  public useExclusiveSegmentations: boolean =
    defaultValues.useExclusiveSegmentations;
  public voxelInfoMode: VoxelInfoMode = defaultValues.voxelInfoMode;
  public performanceMode: PerformanceMode = defaultValues.performanceMode;

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
    this.writeSetting("colorMode", this.colorMode);
    this.writeSetting("language", this.language);
    this.writeSetting(
      "useExclusiveSegmentations",
      this.useExclusiveSegmentations ? "1" : "0",
    );
    this.writeSetting("voxelInfoMode", this.voxelInfoMode);
    this.writeSetting("performanceMode", this.performanceMode);
  }

  public load() {
    const colorMode = this.readSetting("colorMode");
    const language = this.readSetting("language");
    const useExclusiveSegmentations = this.readSetting(
      "useExclusiveSegmentations",
    );
    const voxelInfoMode = this.readSetting("voxelInfoMode");
    const performanceMode = this.readSetting("performanceMode");

    this.setColorMode(colorMode);
    this.setLanguage(language);
    this.setUseExclusiveSegmentations(useExclusiveSegmentations);
    this.setVoxelInfoMode(voxelInfoMode);
    this.setPerformanceMode(performanceMode);
  }

  protected writeSetting<T extends SettingKey>(key: T, value: string): void {
    localStorage.setItem(`settings.${key}`, value);
  }

  protected readSetting<T extends SettingKey>(key: T): typeof defaultValues[T] {
    return (localStorage.getItem(`settings.${key}`) ||
      defaultValues[key]) as typeof defaultValues[T];
  }
}
