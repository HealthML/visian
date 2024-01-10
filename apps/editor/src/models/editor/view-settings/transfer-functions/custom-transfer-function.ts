import {
  ICustomTransferFunction,
  IDocument,
  IFileParameter,
} from "@visian/ui-shared";
import { action, makeObservable, observable, reaction } from "mobx";
import * as THREE from "three";

import { TransferFunction } from "./transfer-function";
import { Parameter } from "../../parameters";
import { FileParameter } from "../../parameters/file-parameter";

export class CustomTransferFunction
  extends TransferFunction<"custom">
  implements ICustomTransferFunction
{
  public texture?: THREE.Texture;

  constructor(document: IDocument) {
    super(
      {
        name: "custom",
        labelTx: "tf-custom",
        params: [
          new FileParameter({
            name: "file",
            labelTx: "custom-tf-file",
            defaultValue: undefined,
          }) as Parameter<unknown>,
        ],
      },
      document,
    );

    makeObservable<this, "setTexture">(this, {
      texture: observable,
      setTexture: action,
    });

    reaction(
      () => (this.params.file as IFileParameter).value,
      (file?: File) => {
        if (!file) return this.setTexture();

        const reader = new FileReader();
        reader.addEventListener(
          "load",
          () => {
            new THREE.TextureLoader().load(
              reader.result as string,
              (texture) => {
                this.setTexture(texture);
              },
            );
          },
          false,
        );

        reader.readAsDataURL(file);
      },
    );
  }

  protected setTexture(texture?: THREE.Texture) {
    this.document.viewport3D.onTransferFunctionChange();

    this.texture = texture;
  }
}
