import {
  AnnotationGroupSnapshot,
  dataColorKeys,
  ErrorNotification,
  i18n,
  IAnnotationGroup,
  IDocument,
  IEditor,
  IImageLayer,
  ILayer,
  ISliceRenderer,
  IVolumeRenderer,
  LayerSnapshot,
  MeasurementType,
  PerformanceMode,
  Theme,
  TrackingLog,
  ValueType,
} from "@visian/ui-shared";
import {
  BackendMetadata,
  FileWithAnnotationGroup,
  FileWithMetadata,
  handlePromiseSettledResult,
  IDisposable,
  ImageMismatchError,
  ISerializable,
  isMiaMetadata,
  ITKImageWithUnit,
  ITKMatrix,
  readMedicalImage,
  writeSingleMedicalImage,
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
import { readTrackingLog, TrackingData } from "../tracking";
import { StoreContext } from "../types";
import { AnnotationGroup } from "./annotation-groups";
import { Clipboard } from "./clipboard";
import { History, HistorySnapshot } from "./history";
import { ImageLayer } from "./layers";
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
  annotationGroups: AnnotationGroupSnapshot[];

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
  protected layerMap: { [layerId: string]: ILayer };
  protected annotationGroupMap: { [annotionGroupId: string]: AnnotationGroup };
  protected layerIds: string[];

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
    this.annotationGroupMap = {};
    snapshot?.layerMap.forEach((layer) => {
      const LayerKind = layerMap[layer.kind];
      if (!LayerKind) return;
      this.layerMap[layer.id] = new LayerKind(layer as any, this);
    });
    this.layerIds = snapshot?.layerIds || [];

    Object.values(this.layerMap).forEach((layer) =>
      layer.fixPotentiallyBadColor(),
    );

    snapshot?.annotationGroups.forEach((group) => {
      this.annotationGroupMap[group.id] = new AnnotationGroup(group, this);
    });
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
      | "annotationGroupMap"
      | "layerIds"
    >(this, {
      id: observable,
      titleOverride: observable,
      activeLayerId: observable,
      measurementDisplayLayerId: observable,
      layerMap: observable,
      annotationGroupMap: observable,
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
      layers: computed,
      renderingOrder: computed,
      annotationGroups: computed,
      activeLayer: computed,
      measurementDisplayLayer: computed,
      imageLayers: computed,
      mainImageLayer: computed,
      annotationLayers: computed,
      maxVisibleLayers: computed,
      maxVisibleLayers3d: computed,

      setTitle: action,
      setLayerIds: action,
      setActiveLayer: action,
      setMeasurementDisplayLayer: action,
      setMeasurementType: action,
      addLayer: action,
      addNewAnnotationLayer: action,
      deleteLayer: action,
      toggleTypeAndRepositionLayer: action,
      importImage: action,
      importAnnotation: action,
      importTrackingLog: action,
      setShowLayerMenu: action,
      toggleLayerMenu: action,
      setUseExclusiveSegmentations: action,
      applySnapshot: action,
      getAnnotationGroup: action,
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
    // TODO dispose of layerFamilies
  }

  public get title(): string | undefined {
    if (this.titleOverride) return this.titleOverride;
    const groupMeta = this.activeLayer?.annotationGroup?.metadata;
    if (isMiaMetadata(groupMeta)) {
      return groupMeta.dataUri;
    }
    const { length } = this.layers;
    if (!length) return undefined;
    const lastLayer = this.layers[this.layers.length - 1];
    const layerMeta = lastLayer?.metadata;
    if (isMiaMetadata(layerMeta)) {
      return layerMeta?.dataUri?.split("/").pop();
    }
    return lastLayer?.title;
  }

  public setTitle = (value?: string): void => {
    this.titleOverride = value;
  };

  // Layer Management
  public get maxVisibleLayers(): number {
    return (this.renderer?.capabilities.maxTextures || 0) - generalTextures2d;
  }

  public get maxVisibleLayers3d(): number {
    return (this.renderer?.capabilities.maxTextures || 0) - generalTextures3d;
  }

  public setLayerIds(layerIds: string[]) {
    this.layerIds = layerIds;
  }

  public get layers(): ILayer[] {
    return this.layerIds.flatMap((id) => {
      if (this.annotationGroupMap[id]) {
        return this.annotationGroupMap[id].layers;
      }
      return this.layerMap[id];
    });
  }

  // considers all layers that are not in a annotation group
  public get documentLayers(): ILayer[] {
    return this.layers.filter((layer) => layer.annotationGroup === undefined);
  }

  public get renderingOrder(): (ILayer | IAnnotationGroup)[] {
    return this.layerIds.map((id) => {
      if (this.annotationGroupMap[id]) {
        return this.annotationGroupMap[id];
      }
      return this.layerMap[id];
    });
  }

  public get annotationGroups(): IAnnotationGroup[] {
    return this.layerIds
      .filter((id) => !!this.annotationGroupMap[id])
      .map((id) => this.annotationGroupMap[id]);
  }

  public get activeLayer(): ILayer | undefined {
    return this.layers.find((layer) => layer.id === this.activeLayerId);
  }

  public get measurementDisplayLayer(): IImageLayer | undefined {
    return this.layers.find(
      (layer) =>
        layer.id === this.measurementDisplayLayerId && layer.kind === "image",
    ) as IImageLayer | undefined;
  }

  public get imageLayers(): IImageLayer[] {
    return this.layers.filter(
      (layer) => layer.kind === "image" && layer.isVisible,
    ) as IImageLayer[];
  }

  public get mainImageLayer(): IImageLayer | undefined {
    const areAllLayersAnnotations = Boolean(
      !this.layers.find(
        (layer) => layer.kind === "image" && !layer.isAnnotation,
      ),
    );

    const areAllImageLayersInvisible = Boolean(
      !this.layers.find(
        (layer) =>
          layer.kind === "image" && !layer.isAnnotation && layer.isVisible,
      ),
    );

    let mainImageLayer: ImageLayer | undefined;
    this.layers.slice().find((layer) => {
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

  public getOrphanAnnotationLayers(): ILayer[] {
    const orphanAnnotationLayers = this.layers.filter(
      (l) => l.isAnnotation && !l.annotationGroup,
    );
    return orphanAnnotationLayers ?? [];
  }

  public getAnnotationGroup(id: string): IAnnotationGroup | undefined {
    return this.annotationGroupMap[id];
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
  /** Ensures consistency of layerIds. addLayer should be called whenever a layer is moved or changes annotation group
  if the layer has a annotation group, it will be removed from layerIds
  if an index is specified, the annotation group will be inserted at the index
  if no index is specified, the annotation group remain where it was if already in the list
  if not in the list, annotations will be inserted at the start and images at the end of the list */
  public addLayer = (layer: ILayer, index?: number): void => {
    if (!layer.id) return;
    if (!this.layerMap[layer.id]) {
      this.layerMap[layer.id] = layer;
    }
    const oldIndex = this.layerIds.indexOf(layer.id);
    if (layer.annotationGroup) {
      if (this.layerIds.includes(layer.id)) {
        this.layerIds = this.layerIds.filter((id) => id !== layer.id);
      }
    } else if (index !== undefined) {
      if (oldIndex < 0) {
        this.layerIds.splice(index, 0, layer.id);
      } else if (index !== oldIndex) {
        this.layerIds.splice(index, 0, this.layerIds.splice(oldIndex, 1)[0]);
      }
    } else if (layer.isAnnotation && oldIndex < 0) {
      this.layerIds = this.layerIds.filter((id) => id !== layer.id);
      this.layerIds.unshift(layer.id);
    } else if (oldIndex < 0) {
      this.layerIds = this.layerIds.filter((id) => id !== layer.id);
      this.layerIds.push(layer.id);
    }
  };

  // if an index is specified, the annotation group will be inserted at the index
  // if no index is specified, the annotation group remain where it was if already in the list or inserted at the start
  public addAnnotationGroup = (group: AnnotationGroup, idx?: number): void => {
    if (!group.id) return;

    if (!this.annotationGroupMap[group.id]) {
      this.annotationGroupMap[group.id] = group;
    }
    const oldIndex = this.layerIds.indexOf(group.id);
    if (idx !== undefined) {
      if (oldIndex < 0) {
        this.layerIds.splice(idx, 0, group.id);
      } else if (idx !== oldIndex) {
        this.layerIds.splice(idx, 0, this.layerIds.splice(oldIndex, 1)[0]);
      }
    } else if (oldIndex < 0) {
      this.layerIds.unshift(group.id);
    }
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

  public addNewAnnotationGroup = (title?: string) => {
    if (!this.mainImageLayer) return;

    const annotationColor = this.getFirstUnusedColor();
    const annotationLayer = ImageLayer.fromNewAnnotationForImage(
      this.mainImageLayer.image,
      this,
      annotationColor,
    );
    this.addLayer(annotationLayer);

    const newTitle = title || "new-group";
    const annotationGroup = new AnnotationGroup({ title: newTitle }, this);
    this.addAnnotationGroup(annotationGroup);
    annotationGroup.addLayer(annotationLayer);

    this.setActiveLayer(annotationLayer);

    // Force switch to 2D if too many layers for 3D
    this.viewSettings.setViewMode(this.viewSettings.viewMode);
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
    this.activeLayer?.annotationGroup?.addLayer(annotationLayer);
    this.setActiveLayer(annotationLayer);

    // Force switch to 2D if too many layers for 3D
    this.viewSettings.setViewMode(this.viewSettings.viewMode);
  };

  public deleteLayer = (idOrLayer: string | ILayer): void => {
    const layerId = typeof idOrLayer === "string" ? idOrLayer : idOrLayer.id;

    this.layerIds = this.layerIds.filter((id) => id !== layerId);
    this.layerMap[layerId].delete();
    delete this.layerMap[layerId];
    if (this.activeLayerId === layerId) {
      this.setActiveLayer(this.layerIds[0]);
    }
  };

  public removeLayerFromRootList = (layer: ILayer): void => {
    this.setLayerIds(this.layerIds.filter((id) => id !== layer.id));
  };

  public removeAnnotationGroup = (
    idOrGroup: string | IAnnotationGroup,
  ): void => {
    const groupId = typeof idOrGroup === "string" ? idOrGroup : idOrGroup.id;
    this.setLayerIds(this.layerIds.filter((id) => id !== groupId));
  };

  /** Toggles the type of the layer (annotation or not) and repositions it accordingly */
  public toggleTypeAndRepositionLayer = (idOrLayer: string | ILayer): void => {
    const layerId = typeof idOrLayer === "string" ? idOrLayer : idOrLayer.id;
    const layer = this.getLayer(layerId);
    if (!layer) return;
    layer.setIsAnnotation(!layer.isAnnotation);
  };

  public get has3DLayers(): boolean {
    return this.layers.some((layer) => layer.is3DLayer);
  }

  public get hasChanges() {
    return this.hasDocumentLayersChanges || this.hasGroupChanges;
  }

  public get hasGroupChanges() {
    return this.annotationGroups.some((group) => group.hasChanges);
  }

  // considers all layers that are not in a group
  public get hasDocumentLayersChanges() {
    return this.documentLayers.some((layer) => layer.hasChanges);
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  protected zipLayers = async (layers: ILayer[]) => {
    const zip = new Zip();
    const files = await Promise.all(layers.map((layer) => layer.toFile()));
    files.forEach((file, index) => {
      if (!file) return;
      zip.setFile(`${`00${index}`.slice(-2)}_${file.name}`, file);
    });
    return zip;
  };

  // I/O
  // eslint-disable-next-line @typescript-eslint/no-shadow
  public exportZip = async (layers: ILayer[], limitToAnnotations?: boolean) => {
    const zip = await this.zipLayers(
      layers.filter((layer) => !limitToAnnotations || layer.isAnnotation),
    );

    if (this.context?.getTracker()?.isActive) {
      const trackingFile = this.context.getTracker()?.toFile();
      if (trackingFile) zip.setFile(trackingFile.name, trackingFile);
    }

    FileSaver.saveAs(
      await zip.toBlob(),
      `${this.title?.split(".")[0] ?? "annotation"}.zip`,
    );
  };

  public createZip = async (
    // eslint-disable-next-line @typescript-eslint/no-shadow
    layers: ILayer[],
    title?: string,
  ): Promise<File> => {
    const zip = await this.zipLayers(layers);

    return new File(
      [await zip.toBlob()],
      `${title ?? this.title?.split(".")[0] ?? "annotation"}.zip`,
    );
  };

  public createSquashedNii = async (
    // eslint-disable-next-line @typescript-eslint/no-shadow
    layers: ILayer[],
    title?: string,
  ): Promise<File | undefined> => {
    const imageLayers = this.layers.filter(
      (potentialLayer) =>
        potentialLayer instanceof ImageLayer && potentialLayer.isAnnotation,
    ) as ImageLayer[];
    const file = await writeSingleMedicalImage(
      imageLayers[imageLayers.length - 1].image.toITKImage(
        imageLayers.slice(0, -1).map((layer) => layer.image),
        true,
      ),
      `${title ?? this.title?.split(".")[0] ?? "annotaion"}.nii.gz`,
    );
    return file;
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  public exportSquashedNii = async (layers: ILayer[]) => {
    const file: File | undefined = await this.createSquashedNii(layers);
    if (file) {
      const fileBlob = new Blob([file], { type: file.type });
      FileSaver.saveAs(
        await fileBlob,
        `${this.title?.split(".")[0] ?? "annotaion"}.nii.gz`,
      );
    } else {
      throw Error("export-error");
    }
  };

  public createFileFromLayers = async (
    // eslint-disable-next-line @typescript-eslint/no-shadow
    layers: ILayer[],
    asZip: boolean,
    title?: string,
  ): Promise<File | undefined> => {
    if (asZip) {
      return this.createZip(layers, title);
    }
    return this.createSquashedNii(layers, title);
  };

  public getFileForLayer = async (idOrLayer: string | ILayer) => {
    const layerId = typeof idOrLayer === "string" ? idOrLayer : idOrLayer.id;
    const layer = this.getLayer(layerId);
    if (!layer) return;
    const file = await layer.toFile();
    return file;
  };

  public finishBatchImport() {
    if (!this.layers.some((layer) => layer.isAnnotation)) {
      this.addNewAnnotationGroup(this.mainImageLayer?.title || "new-group");
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
      if ("annotationGroupId" in filteredFiles) {
        const typedFilteredFiles = filteredFiles as FileWithAnnotationGroup;
        const newUnzippedFiles = unzippedFiles.map((unzippedFile) => {
          const newFile = unzippedFile as FileWithAnnotationGroup;
          newFile.annotationGroupId = typedFilteredFiles.annotationGroupId;
          newFile.metadata = typedFilteredFiles.metadata;
          return newFile;
        });
        await this.importFiles(newUnzippedFiles);
      } else {
        await this.importFiles(
          this.createAnnotationGroup(
            unzippedFiles,
            path.basename(filteredFiles.name, path.extname(filteredFiles.name)),
            this.getMetadataFromFile(filteredFiles),
          ),
          filteredFiles.name,
        );
      }
      return;
    } else if (filteredFiles.name.endsWith(".json")) {
      await readTrackingLog(filteredFiles, this);
      return;
    }

    if (Array.isArray(filteredFiles) && !filteredFiles.length) return;

    //! TODO: #513
    // if (this.imageLayers.length >= this.maxVisibleLayers) {
    //   this.setError({
    //     titleTx: "import-error",
    //     descriptionTx: "too-many-layers-2d",
    //     descriptionData: { count: this.maxVisibleLayers },
    //   });
    //   return;
    // }

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
      // Creates an annotation group if it does not yet exists
      if (
        !("annotationGroupId" in filteredFiles) &&
        filteredFiles instanceof File
      ) {
        this.createAnnotationGroup(
          [filteredFiles],
          path.basename(filteredFiles.name, path.extname(filteredFiles.name)),
          this.getMetadataFromFile(filteredFiles),
        );
      }
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
          }
        } else {
          this.setError({
            titleTx: "import-error",
            descriptionTx: "image-loading-error",
          });
        }
      } else {
        //! TODO: #513
        // const numberOfAnnotations = uniqueValues.size - 1;

        // if (
        //   numberOfAnnotations === 1 ||
        //   numberOfAnnotations + this.imageLayers.length > this.maxVisibleLayers
        // ) {
        //   createdLayerId = await this.importAnnotation(
        //     imageWithUnit,
        //     undefined,
        //     true,
        //   );

        //   if (numberOfAnnotations !== 1) {
        //     this.setError({
        //       titleTx: "squashed-layers-title",
        //       descriptionTx: "squashed-layers-import",
        //     });
        //   }
        // } else {

        // Creates an annotation group if it does not yet exists
        if (
          !("annotationGroupId" in filteredFiles) &&
          filteredFiles instanceof File
        ) {
          this.createAnnotationGroup(
            [filteredFiles],
            path.basename(filteredFiles.name, path.extname(filteredFiles.name)),
            this.getMetadataFromFile(filteredFiles),
          );
        }
        uniqueValues.forEach(async (value) => {
          if (value === 0) return;
          createdLayerId = await this.importAnnotation(
            { ...imageWithUnit, name: `${value}_${image.name}` },
            value,
          );
          if (files instanceof File) {
            this.addLayerToAnnotationGroup(createdLayerId, files);
            this.addMetadataToLayer(createdLayerId, files);
          }
        });
        // }
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
      isVisible: this.imageLayers.length < this.maxVisibleLayers,
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
        isVisible: this.imageLayers.length < this.maxVisibleLayers,
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
    const layerIndex = this.layers.indexOf(layer);
    if (layerIndex <= 0) return undefined;
    return this.layers
      .slice(0, layerIndex)
      .filter(
        (potentialLayer) =>
          potentialLayer.isAnnotation &&
          potentialLayer.kind === "image" &&
          potentialLayer.isVisible &&
          potentialLayer.opacity > 0,
      ) as unknown as IImageLayer[];
  }

  /** Adds layer to group specified in file object */
  private addLayerToAnnotationGroup(layerId: string, file: File) {
    const layer = this.getLayer(layerId);
    const group = this.getAnnotationGroupFromFile(file);
    if (layer && group) {
      group.addLayer(layer);
    }
  }

  /** Adds meta data from file with metadata to layer */
  private addMetadataToLayer(layerId: string, file: File) {
    const layer = this.getLayer(layerId);
    const metadata = this.getMetadataFromFile(file);
    if (layer && metadata) {
      layer.metadata = metadata;
    }
  }

  /** Returns the group layer specified in the file object */
  private getAnnotationGroupFromFile(file: File): IAnnotationGroup | undefined {
    if ("annotationGroupId" in file) {
      const fileWithAnnotationGroup = file as FileWithAnnotationGroup;
      return this.getAnnotationGroup(fileWithAnnotationGroup.annotationGroupId);
    }
    return undefined;
  }

  /** Extracts metadata appended to a file object */
  private getMetadataFromFile(file: File): BackendMetadata | undefined {
    if ("metadata" in file) {
      const fileWithMetadata = file as FileWithMetadata;
      return fileWithMetadata.metadata;
    }
    return undefined;
  }

  /** Creates a AnnotationGroup object for a list of files and adds the group id to the files */
  public createAnnotationGroup(
    files: File[],
    title?: string,
    groupMetadata?: BackendMetadata,
  ): FileWithAnnotationGroup[] {
    if (files.every((f) => "annotationGroupId" in f)) {
      return files as FileWithAnnotationGroup[];
    }
    if (files.some((f) => "annotationGroupId" in f)) {
      throw new Error(
        "Cannot create a new group for file that already belongs to a group",
      );
    }
    const annotationGroup = new AnnotationGroup({ title }, this);
    annotationGroup.metadata = groupMetadata;

    const filesWithGroup = files.map((f) => {
      const fileWithGroup = f as FileWithAnnotationGroup;
      fileWithGroup.annotationGroupId = annotationGroup.id;
      return fileWithGroup;
    });
    this.addAnnotationGroup(annotationGroup);
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
      layerMap: this.layers.map((layer) => layer.toJSON()),
      layerIds: toJS(this.layerIds),
      history: this.history.toJSON(),
      viewSettings: this.viewSettings.toJSON(),
      viewport2D: this.viewport2D.toJSON(),
      viewport3D: this.viewport3D.toJSON(),
      tools: this.tools.toJSON(),
      useExclusiveSegmentations: this.useExclusiveSegmentations,
      annotationGroups: this.annotationGroups.map((group) => group.toJSON()),
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

  public canUndo(): boolean {
    return this.activeLayer?.id
      ? this.history.canUndo(this.activeLayer.id)
      : false;
  }

  public canRedo(): boolean {
    return this.activeLayer?.id
      ? this.history.canRedo(this.activeLayer.id)
      : false;
  }

  public undo(): void {
    if (this.activeLayer?.id) {
      this.history.undo(this.activeLayer.id);
    }
  }

  public redo(): void {
    if (this.activeLayer?.id) {
      this.history.redo(this.activeLayer.id);
    }
  }
}
