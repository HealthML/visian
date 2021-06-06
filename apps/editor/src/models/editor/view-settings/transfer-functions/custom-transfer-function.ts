import { IDocument } from "@visian/ui-shared";
import { LayerParameter, Parameter } from "../../parameters";
import { FileParameter } from "../../parameters/file-parameter";
import { TransferFunction } from "./transfer-function";

export class CustomTransferFunction extends TransferFunction<"custom"> {
  constructor(document: IDocument) {
    super(
      {
        name: "custom",
        labelTx: "tf-custom",
        params: [
          new LayerParameter(
            {
              name: "image",
              labelTx: "image-layer",
              defaultValue: undefined,
            },
            document,
          ) as Parameter<unknown>,
          new FileParameter({
            name: "file",
            labelTx: "custom-tf-file",
            defaultValue: undefined,
          }) as Parameter<unknown>,
        ],
      },
      document,
    );
  }
}
