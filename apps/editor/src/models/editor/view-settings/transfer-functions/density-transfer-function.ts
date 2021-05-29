import { IDocument } from "@visian/ui-shared";
import {
  BooleanParameter,
  LayerParameter,
  NumberRangeParameter,
  Parameter,
} from "../../parameters";
import { TransferFunction } from "./transfer-function";

export class DensityTransferFunction extends TransferFunction<"density"> {
  constructor(document: IDocument) {
    super(
      {
        name: "density",
        labelTx: "tf-density",
        params: [
          new LayerParameter(
            {
              name: "annotation",
              labelTx: "annotation-layer",
              defaultValue: undefined,
              filter: (layer) => layer.isAnnotation,
            },
            document,
          ) as Parameter<unknown>,
          new LayerParameter(
            {
              name: "image",
              labelTx: "image-layer",
              defaultValue: undefined,
              filter: (layer) => !layer.isAnnotation,
            },
            document,
          ) as Parameter<unknown>,
          new BooleanParameter({
            name: "useFocus",
            labelTx: "use-focus",
            defaultValue: true,
          }) as Parameter<unknown>,
          new NumberRangeParameter({
            name: "densityRange",
            labelTx: "density-range",
            defaultValue: [0.05, 1],
            min: 0,
            max: 1,
          }) as Parameter<unknown>,
        ],
      },
      document,
    );
  }
}
