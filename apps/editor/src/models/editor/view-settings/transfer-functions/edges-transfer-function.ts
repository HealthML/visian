import { IDocument } from "@visian/ui-shared";
import {
  BooleanParameter,
  ColorParameter,
  NumberParameter,
  NumberRangeParameter,
  Parameter,
} from "../../parameters";
import { TransferFunction } from "./transfer-function";

export class EdgesTransferFunction extends TransferFunction<"fc-edges"> {
  constructor(document: IDocument) {
    super(
      {
        name: "fc-edges",
        labelTx: "tf-fc-edges",
        params: [
          // TODO: Layer parameters.
          new BooleanParameter({
            name: "useFocus",
            labelTx: "use-focus",
            defaultValue: true,
          }) as Parameter<unknown>,
          new NumberRangeParameter({
            name: "range",
            labelTx: "density-range",
            defaultValue: [0.05, 1],
            min: 0,
            max: 1,
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
  }
}
