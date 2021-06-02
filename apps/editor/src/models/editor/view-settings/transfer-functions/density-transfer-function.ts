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
              onBeforeValueChange: () =>
                document.viewport3D?.onTransferFunctionChange(),
            },
            document,
          ) as Parameter<unknown>,
          new LayerParameter(
            {
              name: "image",
              labelTx: "image-layer",
              defaultValue: undefined,
              filter: (layer) => !layer.isAnnotation,
              onBeforeValueChange: () =>
                document.viewport3D?.onTransferFunctionChange(),
            },
            document,
          ) as Parameter<unknown>,
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
            onBeforeValueChange: () =>
              document.viewport3D?.onTransferFunctionChange(),
          }) as Parameter<unknown>,
        ],
      },
      document,
    );
  }

  public activate() {
    if (!this.document.getLayer(this.params.annotation.value as string)) {
      this.params.annotation.reset();
    }

    if (!this.document.getLayer(this.params.image.value as string)) {
      this.params.image.reset();
    }
  }
}
