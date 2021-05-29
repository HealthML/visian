import { IDocument } from "@visian/ui-shared";
import { Vector } from "@visian/utils";
import { action, makeObservable, observable } from "mobx";
import {
  BooleanParameter,
  ColorParameter,
  LayerParameter,
  NumberParameter,
  Parameter,
} from "../../parameters";
import { TransferFunction } from "./transfer-function";

// TODO: Persist cone direction.
export class ConeTransferFunction extends TransferFunction<"fc-cone"> {
  public coneDirection = new Vector([1, 0, 0]);

  constructor(document: IDocument) {
    super(
      {
        name: "fc-cone",
        labelTx: "tf-fc-cone",
        params: [
          new LayerParameter(
            {
              name: "annotation",
              labelTx: "annotation-layer",
              defaultValue: undefined,
              filter: (layer) =>
                layer.isAnnotation &&
                layer.id !== (this.params.image as LayerParameter).value,
            },
            document,
          ) as Parameter<unknown>,
          new LayerParameter(
            {
              name: "image",
              labelTx: "image-layer",
              defaultValue: undefined,
              // We allow other annotations as the image, but not the selected annotation.
              filter: (layer) =>
                layer.id !== (this.params.annotation as LayerParameter).value,
            },
            document,
          ) as Parameter<unknown>,
          new BooleanParameter({
            name: "useFocus",
            labelTx: "use-focus",
            defaultValue: true,
          }) as Parameter<unknown>,
          new BooleanParameter({
            name: "isConeLocked",
            labelTx: "lock-cone",
            defaultValue: false,
          }) as Parameter<unknown>,
          new NumberParameter({
            name: "coneAngle",
            labelTx: "cone-angle",
            defaultValue: 1,
            min: 0,
            max: Math.PI,
          }) as Parameter<unknown>,
          new ColorParameter({
            name: "focusColor",
            labelTx: "focus-color",
            defaultValue: "rgba(255, 255, 255, 1)",
          }) as Parameter<unknown>,
          new NumberParameter({
            name: "contextOpacity",
            labelTx: "context-opacity",
            defaultValue: 0.4,
            min: 0,
            max: 1,
            scaleType: "quadratic",
          }) as Parameter<unknown>,
        ],
      },
      document,
    );

    makeObservable<this>(this, {
      coneDirection: observable,
      setConeDirection: action,
    });
  }

  public setConeDirection(x: number, y: number, z: number) {
    this.coneDirection.set(x, y, z);
  }
}
