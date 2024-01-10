import { IDocument } from "@visian/ui-shared";

import { TransferFunction } from "./transfer-function";
import {
  NumberParameter,
  NumberRangeParameter,
  Parameter,
} from "../../parameters";

export class EdgesTransferFunction extends TransferFunction<"fc-edges"> {
  constructor(document: IDocument) {
    super(
      {
        name: "fc-edges",
        labelTx: "tf-fc-edges",
      },
      document,
    );

    this.initializeParams([
      new NumberRangeParameter({
        name: "densityRange",
        labelTx: "density-range",
        defaultValue: [0.1, 1],
        min: 0,
        max: 1,
        onBeforeValueChange: () =>
          document.viewport3D?.onTransferFunctionChange(),
        getHistogram: () => document.mainImageLayer?.gradientHistogram,
      }) as Parameter<unknown>,
      new NumberParameter({
        name: "contextOpacity",
        labelTx: "context-opacity",
        defaultValue: 0.7,
        min: 0,
        max: 1,
        scaleType: "quadratic",
        onBeforeValueChange: () =>
          document.viewport3D?.onTransferFunctionChange(),
      }) as Parameter<unknown>,
    ]);
  }
}
