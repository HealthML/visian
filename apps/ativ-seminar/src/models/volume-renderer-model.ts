import { Vector } from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";
import * as THREE from "three";
import tc from "tinycolor2";

import { TextureAtlas } from "../lib/texture-atlas";
import {
  generateHistogram,
  LightingMode,
  lightingModes,
  LightingModeType,
  TransferFunction,
  transferFunctions,
  TransferFunctionType,
} from "../lib/volume-renderer";

export class VolumeRendererModel {
  public image?: TextureAtlas;
  public focus?: TextureAtlas;
  public densityHistogram?: [number[], number, number];
  public gradientHistogram?: [number[], number, number];
  public backgroundValue = 0;
  /** The camera position in volume coordinates. */
  public cameraPosition = new Vector(3);
  public useFocusVolume = false;
  public focusColor = "rgba(255, 255, 255, 1)";
  public transferFunction = transferFunctions[TransferFunctionType.FCCutaway];
  public lightingMode = lightingModes[LightingModeType.LAO];
  public suppressedLightingMode?: LightingMode;
  public laoIntensity = 1;
  public imageOpacity = 1;
  public contextOpacity = 0.4;
  public densityRangeLimits: [number, number] = [0, 1];
  public edgeRangeLimits: [number, number] = [0.1, 1];
  public rangeLimits: [number, number] = this.edgeRangeLimits;
  public cutAwayConeAngle = 1;
  public cutAwayConeDirection = new Vector([1, 0, 0]);
  public isConeLinkedToCamera = true;
  public customTFTexture?: THREE.Texture;

  public lightingTimeout?: NodeJS.Timer;

  constructor() {
    makeObservable<this, "setCustomTFTexture">(this, {
      image: observable,
      focus: observable,
      densityHistogram: observable.ref,
      gradientHistogram: observable.ref,
      backgroundValue: observable,
      cameraPosition: observable,
      useFocusVolume: observable,
      focusColor: observable,
      transferFunction: observable,
      lightingMode: observable,
      suppressedLightingMode: observable,
      laoIntensity: observable,
      imageOpacity: observable,
      contextOpacity: observable,
      rangeLimits: observable,
      cutAwayConeAngle: observable,
      cutAwayConeDirection: observable,
      isConeLinkedToCamera: observable,
      customTFTexture: observable.ref,

      setImage: action,
      setFocus: action,
      setGradientHistogram: action,
      setBackgroundValue: action,
      setCameraPosition: action,
      setUseFocusVolume: action,
      setFocusColor: action,
      setTransferFunction: action,
      setLightingMode: action,
      setLaoIntensity: action,
      setImageOpacity: action,
      setContextOpacity: action,
      setRangeLimits: action,
      setCutAwayConeAngle: action,
      setCutAwayConeDirection: action,
      setIsConeLinkedToCamera: action,
      setCustomTFTexture: action,
      setSuppressedLightingMode: action,
    });
  }

  @computed
  public get backgroundColor() {
    return `rgb(${this.backgroundValue * 255},${this.backgroundValue * 255},${
      this.backgroundValue * 255
    })`;
  }

  /** Sets the base image to be rendered. */
  public setImage = (image: TextureAtlas) => {
    this.image = image;
    this.densityHistogram = generateHistogram(image.getAtlas());
    this.setUseFocusVolume(false);
    this.onTransferFunctionChange();
  };

  public setFocus = (focus?: TextureAtlas) => {
    this.onTransferFunctionChange();
    this.focus = focus;

    this.setUseFocusVolume(Boolean(focus));
  };

  public setGradientHistogram(histogram: [number[], number, number]) {
    this.gradientHistogram = histogram;
  }

  public setBackgroundValue = (value: number) => {
    this.backgroundValue = Math.max(0, Math.min(1, value));
  };

  public setCameraPosition = (x: number, y: number, z: number) => {
    this.cameraPosition.set(x, y, z);

    if (this.isConeLinkedToCamera) {
      this.setCutAwayConeDirection(x, y, z);
    }
  };

  public setUseFocusVolume = (useFocusVolume: boolean) => {
    this.useFocusVolume = useFocusVolume;
  };

  public setFocusColor = (value: string) => {
    try {
      this.focusColor = tc(value).toRgbString();
    } catch {
      // Intentionally left blank
    }
  };

  public setTransferFunction = (value: TransferFunction) => {
    if (this.transferFunction.type === TransferFunctionType.Density) {
      this.densityRangeLimits = this.rangeLimits;
    } else if (this.transferFunction.type === TransferFunctionType.FCEdges) {
      this.edgeRangeLimits = this.rangeLimits;
    }

    this.transferFunction = value;
    this.laoIntensity = value.defaultLAOIntensity;

    if (this.transferFunction.type === TransferFunctionType.Density) {
      this.rangeLimits = this.densityRangeLimits;
    } else if (this.transferFunction.type === TransferFunctionType.FCEdges) {
      this.rangeLimits = this.edgeRangeLimits;
    }
  };

  public setLightingMode = (value: LightingMode) => {
    this.lightingMode = value;

    if (value.type === LightingModeType.LAO) {
      this.laoIntensity = this.transferFunction.defaultLAOIntensity;
    }
  };

  public setSuppressedLightingMode = (value?: LightingMode) => {
    this.suppressedLightingMode = value;
  };

  public setLaoIntensity = (value: number) => {
    this.laoIntensity = Math.max(0, value);
  };

  public setImageOpacity = (value: number) => {
    this.imageOpacity = Math.max(0, Math.min(1, value));
  };

  public setContextOpacity = (value: number) => {
    this.onTransferFunctionChange();

    this.contextOpacity = Math.max(0, Math.min(1, value));
  };

  public onTransferFunctionChange = () => {
    if (!this.suppressedLightingMode) {
      this.setSuppressedLightingMode(this.lightingMode);
      this.setLightingMode(lightingModes[LightingModeType.None]);
    }

    if (this.lightingTimeout) {
      clearTimeout(this.lightingTimeout);
    }
    this.lightingTimeout = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.setLightingMode(this.suppressedLightingMode!);
      this.setSuppressedLightingMode(undefined);
      this.lightingTimeout = undefined;
    }, 200);
  };

  public setRangeLimits = (value: [number, number]) => {
    this.onTransferFunctionChange();

    this.rangeLimits = [
      Math.max(0, Math.min(1, value[0])),
      Math.max(0, Math.min(1, value[1])),
    ];
  };

  public setCutAwayConeAngle = (radians: number) => {
    this.onTransferFunctionChange();

    this.cutAwayConeAngle = radians;
  };

  public setCutAwayConeDirection = (x: number, y: number, z: number) => {
    if (!this.isConeLinkedToCamera) this.onTransferFunctionChange();

    this.cutAwayConeDirection.set(x, y, z);
  };

  public setIsConeLinkedToCamera = (value = true) => {
    if (value) this.onTransferFunctionChange();

    this.isConeLinkedToCamera = value;
  };

  protected setCustomTFTexture(texture: THREE.Texture) {
    this.customTFTexture = texture;
  }

  public setCustomTFImage = (file: File) => {
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        new THREE.TextureLoader().load(reader.result as string, (texture) => {
          this.setCustomTFTexture(texture);
        });
      },
      false,
    );

    reader.readAsDataURL(file);
  };
}
