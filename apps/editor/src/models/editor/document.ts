import {
  dataColorKeys,
  IDocument,
  IEditor,
  IImageLayer,
  ILayer,
  ISliceRenderer,
  IVolumeRenderer,
  Theme,
  ValueType,
} from "@visian/ui-shared";
import { ISerializable, ITKImage, readMedicalImage, Zip } from "@visian/utils";
import FileSaver from "file-saver";
import { action, computed, makeObservable, observable, toJS } from "mobx";
import path from "path";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";

import {
  defaultAnnotationColor,
  defaultImageColor,
  defaultRegionGrowingPreviewColor,
} from "../../constants";
import { StoreContext } from "../types";
import { History, HistorySnapshot } from "./history";
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

const uniqueValuesForAnnotationThreshold = 20;

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
}

export class Document implements IDocument, ISerializable<DocumentSnapshot> {
  public readonly excludeFromSnapshotTracking = ["editor"];

  public id: string;
  protected titleOverride?: string;

  protected activeLayerId?: string;
  protected layerMap: { [key: string]: Layer };
  protected layerIds: string[];

  public history: History;

  public viewSettings: ViewSettings;
  public viewport2D: Viewport2D;
  public viewport3D: Viewport3D;

  public tools: Tools;

  public showLayerMenu = false;

  public markers: Markers = new Markers(this);

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

    makeObservable<
      this,
      "titleOverride" | "activeLayerId" | "layerMap" | "layerIds"
    >(this, {
      id: observable,
      titleOverride: observable,
      activeLayerId: observable,
      layerMap: observable,
      layerIds: observable,
      history: observable,
      viewSettings: observable,
      viewport2D: observable,
      viewport3D: observable,
      tools: observable,
      showLayerMenu: observable,

      title: computed,
      activeLayer: computed,
      imageLayers: computed,
      baseImageLayer: computed,

      setTitle: action,
      setActiveLayer: action,
      addLayer: action,
      addNewAnnotationLayer: action,
      moveLayer: action,
      deleteLayer: action,
      toggleTypeAndRepositionLayer: action,
      importImage: action,
      importAnnotation: action,
      setShowLayerMenu: action,
      toggleLayerMenu: action,
      applySnapshot: action,
    });

    // This is split up to avoid errors from a tool that is being activated
    // trying to access document.tools
    this.tools = new Tools(undefined, this);
    this.tools.applySnapshot(snapshot?.tools || {});
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
  public get layers(): ILayer[] {
    return this.layerIds.map((id) => this.layerMap[id]);
  }

  public get activeLayer(): ILayer | undefined {
    return Object.values(this.layerMap).find(
      (layer) => layer.id === this.activeLayerId,
    );
  }

  public get imageLayers(): IImageLayer[] {
    return this.layers.filter(
      (layer) => layer.kind === "image",
    ) as IImageLayer[];
  }
  public get baseImageLayer(): IImageLayer | undefined {
    // TODO: Rework to work with group layers

    const areAllLayersAnnotations = Boolean(
      !this.layerIds.find((layerId) => {
        const layer = this.layerMap[layerId];
        return layer.kind === "image" && !layer.isAnnotation;
      }),
    );

    let baseImageLayer: ImageLayer | undefined;
    this.layerIds
      .slice()
      .reverse()
      .find((id) => {
        const layer = this.layerMap[id];
        if (
          layer.kind === "image" &&
          // use non-annotation layer if possible
          (!layer.isAnnotation || areAllLayersAnnotations)
        ) {
          baseImageLayer = layer as ImageLayer;
          return true;
        }
        return false;
      });
    return baseImageLayer;
  }

  public getLayer(id: string): ILayer | undefined {
    return id ? this.layerMap[id] : undefined;
  }

  public setActiveLayer = (idOrLayer?: string | ILayer): void => {
    this.activeLayerId = idOrLayer
      ? typeof idOrLayer === "string"
        ? idOrLayer
        : idOrLayer.id
      : undefined;
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

  public getRegionGrowingPreviewColor = (): string => {
    const isDefaultUsed = this.layers.find(
      (layer) => layer.color === defaultRegionGrowingPreviewColor,
    );
    return isDefaultUsed
      ? this.getFirstUnusedColor(this.activeLayer?.color)
      : defaultRegionGrowingPreviewColor;
  };

  public addNewAnnotationLayer = () => {
    if (!this.baseImageLayer) return;

    const annotationColor = this.getFirstUnusedColor();

    const annotationLayer = ImageLayer.fromNewAnnotationForImage(
      this.baseImageLayer.image,
      this,
      annotationColor,
    );
    this.addLayer(annotationLayer);
    this.setActiveLayer(annotationLayer);
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
        await Promise.all(
          entries.map((entry) => this.importFileSystemEntries(entry)),
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
      await Promise.all(promises);

      if (dirFiles.length) await this.importFiles(dirFiles, entries.name);
    } else {
      await new Promise<void>((resolve, reject) => {
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
  ): Promise<void> {
    const filteredFiles = Array.isArray(files)
      ? files.filter(
          (file) => !file.name.startsWith(".") && file.name !== "DICOMDIR",
        )
      : files;

    if (Array.isArray(filteredFiles)) {
      if (
        filteredFiles.some((file) => path.extname(file.name) !== ".dcm") &&
        filteredFiles.some((file) => path.extname(file.name) !== "")
      ) {
        const promises: Promise<void>[] = [];
        filteredFiles.forEach((file) => {
          promises.push(this.importFiles(file));
        });
        await Promise.all(promises);
        return;
      }
    } else if (filteredFiles.name.endsWith(".zip")) {
      const zip = await Zip.fromZipFile(filteredFiles);
      await this.importFiles(await zip.getAllFiles(), filteredFiles.name);
      return;
    }

    const isFirstLayer = !this.layerIds.length;
    const image = await readMedicalImage(filteredFiles);
    image.name =
      name ||
      (Array.isArray(filteredFiles)
        ? filteredFiles[0]?.name || ""
        : filteredFiles.name);

    if (isAnnotation) {
      await this.importAnnotation(image);
    } else if (isAnnotation !== undefined) {
      await this.importImage(image);
    } else {
      // Infer Type
      let isLikelyImage = false;
      const { data } = image;
      const uniqueValues = new Set();
      for (let index = 0; index < data.length; index++) {
        uniqueValues.add(data[index]);
        if (uniqueValues.size > uniqueValuesForAnnotationThreshold) {
          isLikelyImage = true;
        }
      }
      if (isLikelyImage) {
        await this.importImage(image);
      } else {
        await this.importAnnotation(image);
      }
    }

    if (isFirstLayer) {
      this.viewSettings.reset();
      this.viewport2D.reset();
      this.viewport3D.reset();
      this.history.clear();
    }
  }

  public async importImage(image: ITKImage) {
    const imageLayer = ImageLayer.fromITKImage(image, this, {
      color: defaultImageColor,
    });
    if (
      this.baseImageLayer &&
      !this.baseImageLayer.image.voxelCount.equals(imageLayer.image.voxelCount)
    ) {
      if (imageLayer.image.name) {
        throw new Error(
          `image-mismatch-error-filename:${imageLayer.image.name}`,
        );
      }
      throw new Error("image-mismatch-error");
    }
    this.addLayer(imageLayer);
  }

  public async importAnnotation(image: ITKImage) {
    const annotationLayer = ImageLayer.fromITKImage(image, this, {
      isAnnotation: true,
      color: this.getFirstUnusedColor(),
    });
    if (
      this.baseImageLayer &&
      !this.baseImageLayer.image.voxelCount.equals(
        annotationLayer.image.voxelCount,
      )
    ) {
      throw new Error("image-mismatch-error");
    }

    this.addLayer(annotationLayer);
    this.setActiveLayer(annotationLayer);
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

  // Proxies
  public get sliceRenderer(): ISliceRenderer | undefined {
    return this.editor.sliceRenderer;
  }

  public get volumeRenderer(): IVolumeRenderer | undefined {
    return this.editor.volumeRenderer;
  }

  public get renderers(): THREE.WebGLRenderer[] | undefined {
    return this.editor.renderers;
  }

  public get theme(): Theme {
    return this.editor.theme;
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
