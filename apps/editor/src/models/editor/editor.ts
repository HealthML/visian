import { ITKImage, readMedicalImage } from "@visian/util";
import { action, computed, makeObservable, observable } from "mobx";
import tc from "tinycolor2";

export class Editor {
  public backgroundColor = "#000";
  public image?: ITKImage;
  public annotation?: ITKImage;

  constructor() {
    makeObservable(this, {
      backgroundColor: observable,
      image: observable,
      theme: computed,
      setBackgroundColor: action,
      setImage: action,
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

  public setImage(image: ITKImage) {
    this.annotation = undefined;
    this.image = image;
  }
  public async importImage(imageFile: File) {
    this.setImage(await readMedicalImage(imageFile));
  }

  public setAnnotation(image: ITKImage) {
    this.annotation = image;
  }
  public async importAnnotation(imageFile: File) {
    this.setAnnotation(await readMedicalImage(imageFile));
  }
}
