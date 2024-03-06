import { IDocument } from "@visian/ui-shared";

import { TransferFunction } from "./transfer-function";
import {
  BooleanParameter,
  NumberRangeParameter,
  Parameter,
} from "../../parameters";

export class DensityTransferFunction extends TransferFunction<"density"> {
  constructor(document: IDocument) {
    super(
      {
        name: "density",
        labelTx: "tf-density",
        params: [
          new BooleanParameter({
            name: "useBlockyContext",
            labelTx: "use-blocky-context",
            defaultValue: false,
            onBeforeValueChange: () =>
              document.viewport3D?.onTransferFunctionChange(),
          }) as Parameter<unknown>,
          new BooleanParameter({
            name: "useFocus",
            labelTx: "use-focus",
            defaultValue: false,
            onBeforeValueChange: () =>
              document.viewport3D?.onTransferFunctionChange(),
          }) as Parameter<unknown>,
          new NumberRangeParameter({
            name: "densityRange",
            labelTx: "density-range",
            defaultValue: [0.05, 1],
            min: 0,
            max: 1,
            showRangeHandle: true,
            onBeforeValueChange: () =>
              document.viewport3D?.onTransferFunctionChange(),
            getHistogram: () => document.mainImageLayer?.densityHistogram,
          }) as Parameter<unknown>,
        ],
      },
      document,
    );
  }
}
