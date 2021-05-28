import { IDocument } from "@visian/ui-shared";
import {
  BooleanParameter,
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
          // TODO: Layer parameters.
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
