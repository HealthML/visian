import { IDocument, ITransferFunction } from "@visian/ui-shared";
import { ISerializable } from "@visian/utils";
import { makeObservable, observable } from "mobx";
import { Parameter, ParameterSnapshot } from "../../parameters";

export interface TransferFunctionSnapshot<N extends string> {
  name: N;
  params: ParameterSnapshot[];
}

export interface TransferFunctionConfig<N extends string> {
  name: N;

  label?: string;
  labelTx?: string;

  params?: Parameter[];
}

export class TransferFunction<N extends string>
  implements ITransferFunction<N>, ISerializable<TransferFunctionSnapshot<N>> {
  public readonly excludeFromSnapshotTracking = ["document"];

  public readonly name: N;

  public label?: string;
  public labelTx?: string;

  public params: { [name: string]: Parameter };

  constructor(
    config: TransferFunctionConfig<N>,
    protected document: IDocument,
  ) {
    this.name = config.name;
    this.label = config.label;
    this.labelTx = config.labelTx || config.name;
    this.params = {};
    config.params?.forEach((param) => {
      this.params[param.name] = param;
    });

    makeObservable(this, { params: observable });
  }

  // Serialization
  public toJSON(): TransferFunctionSnapshot<N> {
    return {
      name: this.name,
      params: Object.values(this.params).map((param) => param.toJSON()),
    };
  }

  public applySnapshot(
    snapshot: Partial<TransferFunctionSnapshot<N>>,
  ): Promise<void> {
    if (snapshot.name && snapshot.name !== this.name) {
      throw new Error("Transfer function names do not match");
    }

    snapshot.params?.forEach((paramSnapshot) => {
      const param = this.params[paramSnapshot.name];
      if (param) param.applySnapshot(paramSnapshot);
    });
    return Promise.resolve();
  }
}
