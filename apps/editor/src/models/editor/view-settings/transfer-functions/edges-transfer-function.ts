import { IDocument } from "@visian/ui-shared";
import {
  BooleanParameter,
  LayerParameter,
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
      },
      document,
    );

    this.initializeParams([
      new LayerParameter(
        {
          name: "annotation",
          labelTx: "annotation-layer",
          defaultValue: undefined,
          filter: (layer) =>
            layer.isAnnotation &&
            layer.id !== (this.params.image as LayerParameter)?.value,
          onBeforeValueChange: document.viewport3D.onTransferFunctionChange,
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
            layer.id !== (this.params.annotation as LayerParameter)?.value,
          onBeforeValueChange: document.viewport3D.onTransferFunctionChange,
        },
        document,
      ) as Parameter<unknown>,
      new BooleanParameter({
        name: "useFocus",
        labelTx: "use-focus",
        defaultValue: true,
        onBeforeValueChange: document.viewport3D.onTransferFunctionChange,
      }) as Parameter<unknown>,
      new NumberRangeParameter({
        name: "densityRange",
        labelTx: "density-range",
        defaultValue: [0.05, 1],
        min: 0,
        max: 1,
        onBeforeValueChange: document.viewport3D.onTransferFunctionChange,
      }) as Parameter<unknown>,
      new NumberParameter({
        name: "contextOpacity",
        labelTx: "context-opacity",
        defaultValue: 0.4,
        min: 0,
        max: 1,
        scaleType: "quadratic",
        onBeforeValueChange: document.viewport3D.onTransferFunctionChange,
      }) as Parameter<unknown>,
      new NumberParameter({
        name: "focusOpacity",
        labelTx: "focus-opacity",
        defaultValue: 1,
        min: 0,
        max: 1,
        scaleType: "quadratic",
        onBeforeValueChange: document.viewport3D.onTransferFunctionChange,
      }) as Parameter<unknown>,
    ]);
  }
}
