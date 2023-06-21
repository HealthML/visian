import {
  dataColorKeys,
  ErrorNotification,
  i18n,
  IDocument,
  IEditor,
  IImageLayer,
  ILayer,
  ILayerFamily,
  ISliceRenderer,
  IVolumeRenderer,
  MeasurementType,
  PerformanceMode,
  Theme,
  TrackingLog,
  ValueType,
} from "@visian/ui-shared";
import {
  handlePromiseSettledResult,
  IDisposable,
  ImageMismatchError,
  ISerializable,
  ITKImageWithUnit,
  ITKMatrix,
  readMedicalImage,
  Zip,
} from "@visian/utils";
import FileSaver from "file-saver";
import { action, computed, makeObservable, observable, toJS } from "mobx";
import { parseHeader, Unit } from "nifti-js";
import { inflate } from "pako";
import path from "path";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";

import {
  defaultAnnotationColor,
  defaultImageColor,
  defaultRegionGrowingPreviewColor,
  generalTextures2d,
  generalTextures3d,
} from "../../constants";
import { FileMetadata, FileWithFamily, FileWithMetadata } from "../../types";
import { readTrackingLog, TrackingData } from "../tracking";
import { StoreContext } from "../types";
import { Clipboard } from "./clipboard";
import { History, HistorySnapshot } from "./history";
import { LayerFamily } from "./layer-families";
import { ImageLayer, Layer, LayerSnapshot } from "./layers";
import * as layers from "./layers";
import { Markers } from "./markers";
import { ToolName, Tools, ToolsSnapshot } from "./tools";
import {
  TransferFunctionName,
  Viewport2D,
  Viewport2DSnapshot,
  Viewport3D,
  Viewport3DSnapshot,
  ViewSettings,
  ViewSettingsSnapshot,
} from "./view-settings";

const uniqueValuesForAnnotationThreshold = 10;

export const layerMap: {
  [kind: string]: ValueType<typeof layers>;
} = {};
Object.values(layers).forEach((command) => {
  layerMap[command.kind] = command;
});

export interface DocumentSnapshot {
  id: string;
  titleOverride?: string;

  activeLayerId?: string;
  layerMap: LayerSnapshot[];
  layerIds: string[];

  history: HistorySnapshot;

  viewSettings: ViewSettingsSnapshot;
  viewport2D: Viewport2DSnapshot;
  viewport3D: Viewport3DSnapshot<TransferFunctionName>;

  tools: ToolsSnapshot<ToolName>;

  useExclusiveSegmentations: boolean;
}

export class Document
  implements IDocument, ISerializable<DocumentSnapshot>, IDisposable
{
  public readonly excludeFromSnapshotTracking = ["editor"];

  public id: string;
  protected titleOverride?: string;

  protected activeLayerId?: string;
  protected measurementDisplayLayerId?: string;
  protected layerMap: { [key: string]: Layer };
  protected layerIds: string[];
  public layerFamilies: ILayerFamily[] = [];

  public measurementType: MeasurementType = "volume";

  public history: History;
  public clipboard: Clipboard = new Clipboard(this);

  public viewSettings: ViewSettings;
  public viewport2D: Viewport2D;
  public viewport3D: Viewport3D;

  public tools: Tools;

  public showLayerMenu = false;

  public markers: Markers = new Markers(this);

  public trackingData?: TrackingData;

  public useExclusiveSegmentations = false;

  constructor(
    snapshot: DocumentSnapshot | undefined,
    protected editor: IEditor,
    protected context?: StoreContext,
  ) {
    this.id = snapshot?.id || uuidv4();
    this.titleOverride = snapshot?.titleOverride;
    this.activeLayerId = snapshot?.activeLayerId;
    this.layerMap = {};
    snapshot?.layerMap.forEach((layer) => {
      const LayerKind = layerMap[layer.kind];
      if (!LayerKind) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.layerMap[layer.id] = new LayerKind(layer as any, this);
    });
    this.layerIds = snapshot?.layerIds || [];

    Object.values(this.layerMap).forEach((layer) =>
      layer.fixPotentiallyBadColor(),
    );

    this.history = new History(snapshot?.history, this);
    this.viewSettings = new ViewSettings(snapshot?.viewSettings, this);
    this.viewport2D = new Viewport2D(snapshot?.viewport2D, this);
    this.viewport3D = new Viewport3D(snapshot?.viewport3D, this);

    this.useExclusiveSegmentations = Boolean(
      snapshot?.useExclusiveSegmentations,
    );

    makeObservable<
      this,
      | "titleOverride"
      | "activeLayerId"
      | "measurementDisplayLayerId"
      | "layerMap"
      | "layerIds"
    >(this, {
      id: observable,
      titleOverride: observable,
      activeLayerId: observable,
      measurementDisplayLayerId: observable,
      layerMap: observable,
      layerIds: observable,
      measurementType: observable,
      history: observable,
      viewSettings: observable,
      viewport2D: observable,
      viewport3D: observable,
      tools: observable,
      showLayerMenu: observable,
      trackingData: observable,
      useExclusiveSegmentations: observable,

      title: computed,
      activeLayer: computed,
      measurementDisplayLayer: computed,
      imageLayers: computed,
      mainImageLayer: computed,
      annotationLayers: computed,
      maxLayers: computed,
      maxLayers3d: computed,

      setTitle: action,
      setActiveLayer: action,
      setMeasurementDisplayLayer: action,
      setMeasurementType: action,
      addLayer: action,
      addNewAnnotationLayer: action,
      moveLayer: action,
      deleteLayer: action,
      toggleTypeAndRepositionLayer: action,
      importImage: action,
      importAnnotation: action,
      importTrackingLog: action,
      setShowLayerMenu: action,
      toggleLayerMenu: action,
      setUseExclusiveSegmentations: action,
      applySnapshot: action,
      getLayerFamily: action,
    });

    // This is split up to avoid errors from a tool that is being activated
    // trying to access document.tools
    this.tools = new Tools(undefined, this);
    this.tools.applySnapshot(snapshot?.tools || {});
  }

  public dispose() {
    this.clipboard.dispose();
    this.tools.dispose();
    Object.values(this.layerMap).forEach((layer) => layer.delete());
  }

  public get title(): string | undefined {
    if (this.titleOverride) return this.titleOverride;
    const { length } = this.layerIds;
    return length ? this.getLayer(this.layerIds[length - 1])?.title : undefined;
  }

  public setTitle = (value?: string): void => {
    this.titleOverride = value;
  };

  // Layer Management
  public get maxLayers(): number {
    return (this.renderer?.capabilities.maxTextures || 0) - generalTextures2d;
  }

  public get maxLayers3d(): number {
    return (this.renderer?.capabilities.maxTextures || 0) - generalTextures3d;
  }

  public get layers(): ILayer[] {
    return this.layerIds.map((id) => this.layerMap[id]);
  }

  public get activeLayer(): ILayer | undefined {
    return Object.values(this.layerMap).find(
      (layer) => layer.id === this.activeLayerId,
    );
  }

  public get measurementDisplayLayer(): IImageLayer | undefined {
    return Object.values(this.layerMap).find(
      (layer) =>
        layer.id === this.measurementDisplayLayerId && layer.kind === "image",
    ) as IImageLayer | undefined;
  }

  public get imageLayers(): IImageLayer[] {
    return this.layers.filter(
      (layer) => layer.kind === "image",
    ) as IImageLayer[];
  }
  public get mainImageLayer(): IImageLayer | undefined {
    // TODO: Rework to work with group layers

    const areAllLayersAnnotations = Boolean(
      !this.layerIds.find((layerId) => {
        const layer = this.layerMap[layerId];
        return layer.kind === "image" && !layer.isAnnotation;
      }),
    );

    const areAllImageLayersInvisible = Boolean(
      !this.layerIds.find((layerId) => {
        const layer = this.layerMap[layerId];
        return layer.kind === "image" && !layer.isAnnotation && layer.isVisible;
      }),
    );

    let mainImageLayer: ImageLayer | undefined;
    this.layerIds.slice().find((id) => {
      const layer = this.layerMap[id];
      if (
        layer.kind === "image" &&
        // use non-annotation layer if possible
        (!layer.isAnnotation || areAllLayersAnnotations) &&
        (layer.isVisible || areAllImageLayersInvisible)
      ) {
        mainImageLayer = layer as ImageLayer;
        return true;
      }
      return false;
    });
    return mainImageLayer;
  }

  public get annotationLayers(): ImageLayer[] {
    return this.layers.filter(
      (layer) => layer.kind === "image" && layer.isAnnotation,
    ) as ImageLayer[];
  }

  public getLayer(id: string): ILayer | undefined {
    return id ? this.layerMap[id] : undefined;
  }

  public getLayerFamily(id: string): ILayerFamily | undefined {
    return this.layerFamilies.find((family) => family.id === id);
  }

  public addLayerFamily(family: ILayerFamily): void {
    this.layerFamilies.push(family);
  }

  public setActiveLayer = (idOrLayer?: string | ILayer): void => {
    this.activeLayerId = idOrLayer
      ? typeof idOrLayer === "string"
        ? idOrLayer
        : idOrLayer.id
      : undefined;
  };

  public setMeasurementDisplayLayer = (idOrLayer?: string | ILayer): void => {
    this.measurementDisplayLayerId = idOrLayer
      ? typeof idOrLayer === "string"
        ? idOrLayer
        : idOrLayer.id
      : undefined;
  };

  public setMeasurementType = (measurementType: MeasurementType) => {
    this.measurementType = measurementType;
  };

  public addLayer = (...newLayers: Layer[]): void => {
    newLayers.forEach((layer) => {
      this.layerMap[layer.id] = layer;
      if (layer.isAnnotation) {
        this.layerIds.unshift(layer.id);
      } else {
        // insert image layer after all annotation layers
        let insertIndex = 0;
        for (let i = this.layerIds.length - 1; i >= 0; i--) {
          if (this.layerMap[this.layerIds[i]].isAnnotation) {
            insertIndex = i + 1;
            break;
          }
        }
        this.layerIds.splice(insertIndex, 0, layer.id);
      }
    });
  };

  public getFirstUnusedColor = (
    defaultColor = defaultAnnotationColor,
  ): string => {
    // TODO: Rework to work with group layers
    const layerStack = this.layers;
    const usedColors: { [key: string]: boolean } = {};
    layerStack.forEach((layer) => {
      if (layer.color) {
        usedColors[layer.color] = true;
      }
    });
    const colorCandidates = dataColorKeys.filter((color) => !usedColors[color]);
    return colorCandidates.length ? colorCandidates[0] : defaultColor;
  };

  public getAnnotationPreviewColor = (): string => {
    const isDefaultUsed = this.layers.find(
      (layer) => layer.color === defaultRegionGrowingPreviewColor,
    );
    return isDefaultUsed
      ? this.getFirstUnusedColor(this.activeLayer?.color)
      : defaultRegionGrowingPreviewColor;
  };

  public addNewAnnotationLayer = () => {
    if (!this.mainImageLayer) return;

    const annotationColor = this.getFirstUnusedColor();

    const annotationLayer = ImageLayer.fromNewAnnotationForImage(
      this.mainImageLayer.image,
      this,
      annotationColor,
    );
    this.addLayer(annotationLayer);
    this.setActiveLayer(annotationLayer);

    // Force switch to 2D if too many layers for 3D
    this.viewSettings.setViewMode(this.viewSettings.viewMode);
  };

  public moveLayer(idOrLayer: string | ILayer, newIndex: number) {
    const layerId = typeof idOrLayer === "string" ? idOrLayer : idOrLayer.id;
    const oldIndex = this.layerIds.indexOf(layerId);
    if (!~oldIndex) return;

    this.layerIds.splice(newIndex, 0, this.layerIds.splice(oldIndex, 1)[0]);
  }

  public deleteLayer = (idOrLayer: string | ILayer): void => {
    const layerId = typeof idOrLayer === "string" ? idOrLayer : idOrLayer.id;

    this.layerIds = this.layerIds.filter((id) => id !== layerId);
    delete this.layerMap[layerId];
    if (this.activeLayerId === layerId) {
      this.setActiveLayer(this.layerIds[0]);
    }
  };

  /** Toggles the type of the layer (annotation or not) and repositions it accordingly */
  public toggleTypeAndRepositionLayer = (idOrLayer: string | ILayer): void => {
    const layerId = typeof idOrLayer === "string" ? idOrLayer : idOrLayer.id;
    let lastAnnotationIndex = this.layerIds.length - 1;
    for (let i = 0; i < this.layerIds.length; i++) {
      if (!this.layerMap[this.layerIds[i]].isAnnotation) {
        lastAnnotationIndex = i - 1;
        break;
      }
    }

    if (this.layerMap[layerId].isAnnotation) {
      this.moveLayer(layerId, lastAnnotationIndex);
    } else {
      this.moveLayer(layerId, lastAnnotationIndex + 1);
    }

    this.layerMap[layerId].setIsAnnotation(
      !this.layerMap[layerId].isAnnotation,
    );
  };

  public get has3DLayers(): boolean {
    return Object.values(this.layerMap).some((layer) => layer.is3DLayer);
  }

  // I/O
  public exportZip = async (limitToAnnotations?: boolean) => {
    const zip = new Zip();

    // TODO: Rework for group layers
    const files = await Promise.all(
      this.layers
        .filter((layer) => !limitToAnnotations || layer.isAnnotation)
        .map((layer) => layer.toFile()),
    );
    files.forEach((file, index) => {
      if (!file) return;
      zip.setFile(`${`00${index}`.slice(-2)}_${file.name}`, file);
    });

    if (this.context?.getTracker()?.isActive) {
      const trackingFile = this.context.getTracker()?.toFile();
      if (trackingFile) zip.setFile(trackingFile.name, trackingFile);
    }

    FileSaver.saveAs(await zip.toBlob(), `${this.title}.zip`);
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  public createZip = async (layers: ILayer[]): Promise<File> => {
    const zip = new Zip();
    const files = await Promise.all(layers.map((layer) => layer.toFile()));
    files.forEach((file, index) => {
      if (!file) return;
      zip.setFile(`${`00${index}`.slice(-2)}_${file.name}`, file);
    });

    return new File([await zip.toBlob()], `${this.title}.zip`);
  };

  public createFileFromLayers = async (
    // eslint-disable-next-line @typescript-eslint/no-shadow
    layers: ILayer[],
  ): Promise<File | undefined> => {
    if (layers.length === 1) {
      return layers[0].toFile();
    }
    return this.createZip(layers);
  };

  public getFileForLayer = async (idOrLayer: string | ILayer) => {
    const layerId = typeof idOrLayer === "string" ? idOrLayer : idOrLayer.id;
    const layer = this.layerMap[layerId];
    const file = await layer.toFile();
    return file;
  };

  public finishBatchImport() {
    if (!Object.values(this.layerMap).some((layer) => layer.isAnnotation)) {
      this.addNewAnnotationLayer();
      this.viewport2D.setMainViewType();
    }
    this.context?.persist();
  }

  public async importFileSystemEntries(
    entries: FileSystemEntry | null | (FileSystemEntry | null)[],
  ): Promise<void> {
    if (!entries) return;
    if (Array.isArray(entries)) {
      if (entries.some((entry) => entry && !entry.isFile)) {
        // throw the corresponding error if one promise was rejected
        handlePromiseSettledResult(
          await Promise.allSettled(
            entries.map((entry) => this.importFileSystemEntries(entry)),
          ),
        );
      } else {
        const files = await Promise.all(
          entries.map(
            (entry) =>
              new Promise<File>((resolve, reject) => {
                (entry as FileSystemFileEntry).file((file: File) => {
                  resolve(file);
                }, reject);
              }),
          ),
        );
        if (files.length) await this.importFiles(files);
      }
    } else if (entries.isDirectory) {
      const dirReader = (entries as FileSystemDirectoryEntry).createReader();
      const subEntries: FileSystemEntry[] = [];

      let newSubEntries: FileSystemEntry[];
      do {
        // eslint-disable-next-line no-await-in-loop
        newSubEntries = await new Promise<FileSystemEntry[]>(
          (resolve, reject) => {
            dirReader.readEntries(resolve, reject);
          },
        );
        subEntries.push(...newSubEntries);
      } while (newSubEntries.length);

      const dirFiles: File[] = [];
      const promises: Promise<void>[] = [];
      const { length } = subEntries;
      for (let i = 0; i < length; i++) {
        if (subEntries[i].isFile) {
          promises.push(
            // eslint-disable-next-line no-loop-func
            new Promise((resolve, reject) => {
              (subEntries[i] as FileSystemFileEntry).file((file: File) => {
                dirFiles.push(file);
                resolve();
              }, reject);
            }),
          );
        } else {
          promises.push(this.importFileSystemEntries(subEntries[i]));
        }
      }
      // throw the corresponding error if one promise was rejected
      handlePromiseSettledResult(await Promise.allSettled(promises));

      if (dirFiles.length) await this.importFiles(dirFiles, entries.name);
    } else {
      await new Promise<string | void>((resolve, reject) => {
        (entries as FileSystemFileEntry).file((file: File) => {
          this.importFiles(file).then(resolve).catch(reject);
        }, reject);
      });
    }
  }

  public async importFiles(
    files: File | File[],
    name?: string,
    isAnnotation?: boolean,
  ): Promise<string | void> {
    let filteredFiles = Array.isArray(files)
      ? files.filter(
          (file) => !file.name.startsWith(".") && file.name !== "DICOMDIR",
        )
      : files;

    if (Array.isArray(filteredFiles)) {
      if (filteredFiles.some((file) => path.extname(file.name) === ".json")) {
        const nonJsonFiles = filteredFiles.filter(
          (file) => path.extname(file.name) !== ".json",
        );
        if (nonJsonFiles.length) {
          await this.importFiles(nonJsonFiles);
        }

        filteredFiles = filteredFiles.filter(
          (file) => path.extname(file.name) === ".json",
        );
      }

      if (
        filteredFiles.some((file) => path.extname(file.name) !== ".dcm") &&
        filteredFiles.some((file) => path.extname(file.name) !== "")
      ) {
        const promises: Promise<string | void>[] = [];
        filteredFiles.forEach((file) => {
          promises.push(this.importFiles(file));
        });
        // throw the corresponding error if one promise was rejected
        handlePromiseSettledResult(await Promise.allSettled(promises));
        return;
      }
    } else if (filteredFiles.name.endsWith(".zip")) {
      const zip = await Zip.fromZipFile(filteredFiles);
      const unzippedFiles = await zip.getAllFiles();
      await this.importFiles(
        this.createLayerFamily(
          unzippedFiles,
          filteredFiles.name,
          this.getMetaDataFromFile(filteredFiles),
        ),
        filteredFiles.name,
      );
      return;
    } else if (filteredFiles.name.endsWith(".json")) {
      await readTrackingLog(filteredFiles, this);
      return;
    }

    if (Array.isArray(filteredFiles) && !filteredFiles.length) return;

    if (this.layers.length >= this.maxLayers) {
      this.setError({
        titleTx: "import-error",
        descriptionTx: "too-many-layers-2d",
        descriptionData: { count: this.maxLayers },
      });
      return;
    }

    if (filteredFiles instanceof File) {
      this.createLayerFamily(
        [filteredFiles],
        filteredFiles.name,
        this.getMetaDataFromFile(filteredFiles),
      );
    } else {
      this.createLayerFamily(filteredFiles, name ?? uuidv4());
    }
    let createdLayerId = "";
    const isFirstLayer =
      !this.layerIds.length || !this.layers.some((l) => l.kind !== "group");
    const image = await readMedicalImage(filteredFiles);
    image.name =
      name ||
      (Array.isArray(filteredFiles)
        ? filteredFiles[0]?.name || ""
        : filteredFiles.name);

    const firstFile = Array.isArray(filteredFiles)
      ? filteredFiles[0]
      : filteredFiles;
    let unit: Unit = "";
    if (path.extname(firstFile.name) === ".dcm") {
      // DICOM always has mm as unit: https://dicom.innolitics.com/ciods/ct-image/image-plane/00280030
      unit = "mm";
    } else if (
      path.extname(firstFile.name) === ".nii" ||
      firstFile.name.endsWith(".nii.gz")
    ) {
      try {
        let arrayBuffer = await firstFile.arrayBuffer();
        if (firstFile.name.endsWith(".nii.gz")) {
          arrayBuffer = inflate(new Uint8Array(arrayBuffer));
        }
        // Nifti specifies one unit per dimension. Usually they are all the same. We don't show a unit if they are not the same.
        const units = parseHeader(arrayBuffer).spaceUnits;
        const areAllEqual = units.every((val) => val === units[0]);
        unit = areAllEqual ? units[0] : "";
      } catch (ex) {
        // Leave unit undefined if parsing fails.
      }
    }

    const imageWithUnit = { unit, ...image };

    if (isAnnotation) {
      createdLayerId = await this.importAnnotation(imageWithUnit);
    } else if (isAnnotation !== undefined) {
      createdLayerId = await this.importImage(imageWithUnit);
    } else {
      // Infer Type
      let isLikelyImage = false;
      const { data } = image;
      const uniqueValues = new Set<number>();
      for (let index = 0; index < data.length; index++) {
        uniqueValues.add(data[index]);
        if (uniqueValues.size > uniqueValuesForAnnotationThreshold) {
          isLikelyImage = true;
        }
      }
      if (isLikelyImage) {
        if (imageWithUnit.imageType.dimension < 4) {
          createdLayerId = await this.importImage(imageWithUnit);
        } else if (imageWithUnit.imageType.dimension === 4) {
          // Import multiple layers from a 4D image

          const numberOfLayers = imageWithUnit.size[3];

          // Remove last row and column.
          const direction = new ITKMatrix(3, 3);
          const originalDirection = imageWithUnit.direction.data;
          direction.data = [
            originalDirection[0],
            originalDirection[1],
            originalDirection[2],
            originalDirection[4],
            originalDirection[5],
            originalDirection[6],
            originalDirection[8],
            originalDirection[9],
            originalDirection[10],
          ];

          const prototypeImage = {
            imageType: { ...image.imageType, dimension: 3 },
            unit: imageWithUnit.unit,
            direction,
            size: imageWithUnit.size.slice(0, 3),
            spacing: imageWithUnit.spacing.slice(0, 3),
            origin: imageWithUnit.origin.slice(0, 3),
          };

          const layerSize =
            prototypeImage.size[0] *
            prototypeImage.size[1] *
            prototypeImage.size[2];

          for (let layerIndex = 0; layerIndex < numberOfLayers; layerIndex++) {
            // eslint-disable-next-line no-await-in-loop
            createdLayerId = await this.importImage({
              data: imageWithUnit.data.slice(
                layerIndex * layerSize,
                (layerIndex + 1) * layerSize,
              ),
              name: `${layerIndex}_${imageWithUnit.name}`,
              ...prototypeImage,
            });
            if (files instanceof File) {
              this.addLayerToFamily(createdLayerId, files);
              this.addMetaDataToLayer(createdLayerId, files);
            }
          }
        } else {
          this.setError({
            titleTx: "import-error",
            descriptionTx: "image-loading-error",
          });
        }
      } else {
        const numberOfAnnotations = uniqueValues.size - 1;

        if (
          numberOfAnnotations === 1 ||
          numberOfAnnotations + this.layers.length > this.maxLayers
        ) {
          createdLayerId = await this.importAnnotation(
            imageWithUnit,
            undefined,
            true,
          );

          if (numberOfAnnotations !== 1) {
            this.setError({
              titleTx: "squashed-layers-title",
              descriptionTx: "squashed-layers-import",
            });
          }
        } else {
          uniqueValues.forEach(async (value) => {
            if (value === 0) return;
            createdLayerId = await this.importAnnotation(
              { ...imageWithUnit, name: `${value}_${image.name}` },
              value,
            );
            if (files instanceof File) {
              this.addLayerToFamily(createdLayerId, files);
              this.addMetaDataToLayer(createdLayerId, files);
            }
          });
        }
      }

      // Force switch to 2D if too many layers for 3D
      this.viewSettings.setViewMode(this.viewSettings.viewMode);
    }

    if (isFirstLayer) {
      this.viewSettings.reset();
      this.viewport2D.reset();
      this.viewport3D.reset();
      this.history.clear();
    }

    if (files instanceof File) {
      this.addLayerToFamily(createdLayerId, files);
      this.addMetaDataToLayer(createdLayerId, files);
    }
    return createdLayerId;
  }

  private checkHardwareRequirements(size: number[]) {
    if (!this.renderer) return;

    const is3D =
      size.reduce((previous, current) => previous + (current > 1 ? 1 : 0), 0) >
      2;

    let dimensionLimit = Infinity;
    if (is3D) {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      dimensionLimit = gl.getParameter(gl.MAX_3D_TEXTURE_SIZE);
    } else {
      dimensionLimit = this.renderer.capabilities.maxTextureSize ?? 0;
    }

    if (size.some((value) => value > dimensionLimit)) {
      throw new Error("image-too-large-error");
    }
  }

  public async importImage(image: ITKImageWithUnit) {
    this.checkHardwareRequirements(image.size);

    const imageLayer = ImageLayer.fromITKImage(image, this, {
      color: defaultImageColor,
    });
    if (
      this.mainImageLayer &&
      !this.mainImageLayer.image.voxelCount.equals(imageLayer.image.voxelCount)
    ) {
      if (imageLayer.image.name) {
        throw new ImageMismatchError(
          i18n.t("image-mismatch-error-filename", {
            fileName: imageLayer.image.name,
          }),
        );
      }
      throw new ImageMismatchError(i18n.t("image-mismatch-error"));
    }
    this.addLayer(imageLayer);
    return imageLayer.id;
  }

  public async importAnnotation(
    image: ITKImageWithUnit,
    filterValue?: number,
    squash?: boolean,
  ) {
    this.checkHardwareRequirements(image.size);

    const annotationLayer = ImageLayer.fromITKImage(
      image,
      this,
      {
        isAnnotation: true,
        color: this.getFirstUnusedColor(),
      },
      filterValue,
      squash,
    );
    if (
      this.mainImageLayer &&
      !this.mainImageLayer.image.voxelCount.equals(
        annotationLayer.image.voxelCount,
      )
    ) {
      if (annotationLayer.image.name) {
        throw new ImageMismatchError(
          i18n.t("image-mismatch-error-filename", {
            fileName: annotationLayer.image.name,
          }),
        );
      }
      throw new ImageMismatchError(i18n.t("image-mismatch-error"));
    }

    this.addLayer(annotationLayer);
    this.setActiveLayer(annotationLayer);
    return annotationLayer.id;
  }

  public importTrackingLog(log: TrackingLog) {
    if (!this.mainImageLayer) {
      throw new Error("tracking-data-no-image-error");
    }
    this.trackingData = new TrackingData(log, this.mainImageLayer.image);
  }

  public async save(): Promise<void> {
    return this.context?.persistImmediately();
  }

  public async requestSave(): Promise<void> {
    return this.context?.persist();
  }

  // UI state
  public setShowLayerMenu = (value = false): void => {
    this.showLayerMenu = value;
  };
  public toggleLayerMenu = (): void => {
    this.setShowLayerMenu(!this.showLayerMenu);
  };

  // Exclusive Segmentations
  public setUseExclusiveSegmentations = (value = false) => {
    this.useExclusiveSegmentations = value;
  };

  public getExcludedSegmentations(layer: ILayer) {
    if (!this.useExclusiveSegmentations) return undefined;
    const layerIndex = this.layerIds.indexOf(layer.id);
    if (layerIndex <= 0) return undefined;
    return this.layerIds
      .slice(0, layerIndex)
      .map((layerId) => this.layerMap[layerId])
      .filter(
        (potentialLayer) =>
          potentialLayer.isAnnotation &&
          potentialLayer.kind === "image" &&
          potentialLayer.isVisible &&
          potentialLayer.opacity > 0,
      ) as unknown as IImageLayer[];
  }

  /** Adds layer to group specified in file object */
  private addLayerToFamily(layerId: string, file: File) {
    const layer = this.getLayer(layerId);
    const family = this.getLayerFamilyFromFile(file);
    if (layer && family) {
      family?.addLayer(layer.id);
    }
  }

  /** Adds meta data from file with metadata to layer */
  private addMetaDataToLayer(layerId: string, file: File) {
    const layer = this.getLayer(layerId);
    if (file instanceof File) {
      const metaData = this.getMetaDataFromFile(file);
      if (layer && metaData) {
        layer.metaData = metaData;
      }
    }
  }

  /** Returns the group layer specified in the file object */
  private getLayerFamilyFromFile(file: File): ILayerFamily | undefined {
    if ("familyId" in file) {
      const fileWithFamily = file as FileWithFamily;
      return this.getLayerFamily(fileWithFamily.familyId);
    }
    return undefined;
  }

  /** Extracts metadata appended to a file object */
  private getMetaDataFromFile(file: File): FileMetadata | undefined {
    if ("metadata" in file) {
      const fileWithMetaData = file as FileWithMetadata;
      return fileWithMetaData.metadata;
    }
    return undefined;
  }

  /** Creates a LayerFamily object for a list of files and adds the group id to the files */
  public createLayerFamily(
    files: File[],
    title?: string,
    groupMetaData?: FileMetadata,
  ): FileWithFamily[] {
    if (files.every((f) => "familyId" in f)) {
      return files as FileWithFamily[];
    }
    if (files.some((f) => "familyId" in f)) {
      throw new Error(
        "Cannot create a new group for file that already belongs to a group",
      );
    }
    const layerFamily = new LayerFamily(this, title);
    layerFamily.metaData = groupMetaData;

    const filesWithGroup = files.map((f) => {
      const fileWithGroup = f as FileWithFamily;
      fileWithGroup.familyId = layerFamily.id;
      return fileWithGroup;
    });
    this.addLayerFamily(layerFamily);
    return filesWithGroup;
  }

  // Proxies
  public get sliceRenderer(): ISliceRenderer | undefined {
    return this.editor.sliceRenderer;
  }

  public get volumeRenderer(): IVolumeRenderer | undefined {
    return this.editor.volumeRenderer;
  }

  public get renderer(): THREE.WebGLRenderer | undefined {
    return this.editor.renderer;
  }

  public get theme(): Theme {
    return this.editor.theme;
  }

  public setError = (error: ErrorNotification) => {
    this.context?.setError(error);
  };

  public get performanceMode(): PerformanceMode {
    return this.editor.performanceMode;
  }

  // Serialization
  public toJSON(): DocumentSnapshot {
    return {
      id: this.id,
      titleOverride: this.titleOverride,
      activeLayerId: this.activeLayerId,
      layerMap: Object.values(this.layerMap).map((layer) => layer.toJSON()),
      layerIds: toJS(this.layerIds),
      history: this.history.toJSON(),
      viewSettings: this.viewSettings.toJSON(),
      viewport2D: this.viewport2D.toJSON(),
      viewport3D: this.viewport3D.toJSON(),
      tools: this.tools.toJSON(),
      useExclusiveSegmentations: this.useExclusiveSegmentations,
    };
  }

  public async applySnapshot(
    snapshot: Partial<DocumentSnapshot>,
  ): Promise<void> {
    if (snapshot.id && snapshot.id !== this.id) {
      throw new Error("The document ids do not match");
    }

    throw new Error(
      "This is a noop. To load a document from storage, create a new instance",
    );
  }
}
