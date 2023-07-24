import { MiaAnnotation } from "@visian/mia-api";
import {
  Button,
  DropDown,
  ILayer,
  LayerList,
  PopUp,
  Text,
  TextField,
  useTranslation,
} from "@visian/ui-shared";
import { FileWithMetadata } from "@visian/utils";
import { AxiosError } from "axios";
import { observer } from "mobx-react-lite";
import path from "path";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { importFilesToDocument } from "../../../import-handling";
import { LayerFamily } from "../../../models/editor/layer-families";
import { MiaReviewTask } from "../../../models/review-strategy";
import { fetchAnnotationFile } from "../../../queries";
import { SavePopUpProps } from "./save-popup.props";

const SectionLabel = styled(Text)`
  font-size: 14px;
  margin-bottom: 8px;
`;

const SaveAsInput = styled(TextField)`
  margin: 0px 10px 0px 0px;
  width: 100%;
`;

const SaveInput = styled(TextField)`
  margin: 0px 10px 0px 0px;
  width: 100%;
  color: gray;
`;

const SaveButton = styled(Button)`
  min-width: 110px;
`;

const InlineRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 28px;
`;

const InlineRowLast = styled(InlineRow)`
  margin-bottom: 10px;
`;

const SavePopUpContainer = styled(PopUp)`
  align-items: left;
  width: 60%;
`;

const StyledDropDown = styled(DropDown)`
  margin: 0px 10px 0px 0px;
  width: 200px;
`;

export const SavePopUp = observer<SavePopUpProps>(({ isOpen, onClose }) => {
  const store = useStore();
  const [newAnnotationURIPrefix, setnewAnnotationURIPrefix] = useState("");

  const { t: translate } = useTranslation();

  const fileExtensions = [
    { value: ".nii.gz", label: ".nii.gz" },
    { value: ".zip", label: ".zip" },
  ];

  const [selectedExtension, setSelectedExtension] = useState(
    fileExtensions[0].value,
  );

  const newDataUri = useMemo(
    () => `${newAnnotationURIPrefix}${selectedExtension}`,
    [newAnnotationURIPrefix, selectedExtension],
  );

  const createFamilyForNewAnnotation = (
    layer: ILayer | undefined,
    annotation: MiaAnnotation | undefined,
  ) => {
    const document = store?.editor.activeDocument;
    if (document && layer) {
      const layerFamily = new LayerFamily(document);
      document.addLayerFamily(layerFamily);
      if (annotation) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        layerFamily.title = annotation.dataUri.split("/").pop() ?? "family :)";
        layerFamily.metaData = annotation;
      }
      const familyLayers = layer.getFamilyLayers();
      familyLayers.forEach((l) => layerFamily.addLayer(l.id));
      return layerFamily;
    }
  };

  const createFileForFamilyOf = async (
    layer: ILayer | undefined,
    asZip: boolean,
  ): Promise<File | undefined> => {
    if (layer?.isAnnotation) {
      const layersToSave = layer.getFamilyLayers();
      const file = await store?.editor?.activeDocument?.createFileFromLayers(
        layersToSave,
        asZip,
        newAnnotationURIPrefix.split("/").pop() ?? "annotation",
      );
      return file;
    }
  };

  const checkAnnotationURI = (file: File, uri: string) => {
    if (path.extname(uri) !== path.extname(file.name)) {
      throw new Error(
        translate("uri-file-type-mismatch", { name: path.extname(file.name) }),
      );
    }
  };

  const importAnnotationFile = async (annotationFile: FileWithMetadata) => {
    const fileTransfer = new DataTransfer();
    fileTransfer.items.add(annotationFile);
    if (store) {
      await importFilesToDocument(fileTransfer.files, store);
    }
  };

  const canBeOverwritten = useCallback(() => {
    const activeLayer = store?.editor.activeDocument?.activeLayer;
    const annotation = activeLayer?.family?.metaData as MiaAnnotation;
    return !!annotation;
  }, [store]);

  const saveAnnotation = async () => {
    store?.setProgress({ labelTx: "saving" });
    try {
      const activeLayer = store?.editor.activeDocument?.activeLayer;
      const annotationMeta = activeLayer?.family?.metaData as MiaAnnotation;
      const annotationFile = await createFileForFamilyOf(
        activeLayer,
        annotationMeta?.dataUri.endsWith(".zip"),
      );
      if (!annotationMeta || !annotationFile) {
        throw new Error(translate("create-annotation-error"));
      }
      checkAnnotationURI(annotationFile, annotationMeta.dataUri);
      await store?.reviewStrategy?.currentTask?.updateAnnotation(
        annotationMeta.id,
        [annotationFile],
      );
      activeLayer?.getFamilyLayers().forEach((layer) => {
        store?.editor.activeDocument?.history?.updateCheckpoint(layer.id);
      });
      return true;
    } catch (error) {
      if (error instanceof AxiosError) {
        const description = error.response?.data?.message
          ? error.response.data.message
          : error.message
          ? error.message
          : "annotation-saving-error";
        store?.setError({
          titleTx: "saving-error",
          descriptionTx: description,
        });
      }
      throw error;
    } finally {
      store?.setProgress();
    }
  };

  const loadOldAnnotation = async (
    newAnnotationMeta: MiaAnnotation,
    oldAnnotationMeta: MiaAnnotation,
  ) => {
    const activeLayer = store?.editor.activeDocument?.activeLayer;
    if (activeLayer?.family) {
      activeLayer.family.metaData = newAnnotationMeta;
      activeLayer.family.title = newAnnotationMeta.dataUri;
      activeLayer.family.layers.forEach((layer, index) => {
        layer.metadata = newAnnotationMeta;
        layer.setTitle(
          `${index + 1}_${newAnnotationMeta.dataUri.split("/").pop()}`,
        );
      });
    }
    const oldAnnotationFile = await fetchAnnotationFile(oldAnnotationMeta.id);
    await importAnnotationFile(oldAnnotationFile);
    if (activeLayer) {
      store?.editor.activeDocument?.setActiveLayer(activeLayer.id);
    }
  };

  const saveAnnotationAs = async (uri: string) => {
    store?.setProgress({ labelTx: "saving" });
    try {
      const activeLayer = store?.editor.activeDocument?.activeLayer;
      const reviewTask = store?.reviewStrategy?.currentTask;
      const annotationFile = (await createFileForFamilyOf(
        activeLayer,
        uri.endsWith(".zip"),
      )) as FileWithMetadata;
      if (!reviewTask || !annotationFile) {
        throw new Error(translate("create-annotation-error"));
      }
      annotationFile.metadata = { id: "", dataUri: uri };
      const newAnnotationId = await reviewTask.createAnnotation([
        annotationFile,
      ]);
      const annotationMeta = activeLayer?.family?.metaData as MiaAnnotation;
      const newAnnotationMeta =
        reviewTask instanceof MiaReviewTask
          ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            reviewTask.getAnnotation(newAnnotationId)!
          : annotationMeta;
      if (!annotationMeta) {
        createFamilyForNewAnnotation(activeLayer, newAnnotationMeta);
      } else {
        await loadOldAnnotation(newAnnotationMeta, annotationMeta);
      }
      activeLayer?.getFamilyLayers().forEach((layer) => {
        store?.editor.activeDocument?.history?.updateCheckpoint(layer.id);
      });
      store?.setProgress();
      return true;
    } catch (error) {
      let description = "annotation-saving-error";
      if (error instanceof AxiosError) {
        description =
          error.response?.data?.message ?? error.message ?? description;
      }
      store?.setError({
        titleTx: "saving-error",
        descriptionTx: description,
      });
      store?.setProgress();
    }
  };

  const getAnnotationURIPrefixSuggestion = useCallback(() => {
    const activeLayer = store?.editor.activeDocument?.activeLayer;
    if (!activeLayer) {
      return "annotation";
    }
    const imageURI =
      store?.editor.activeDocument?.mainImageLayer?.metadata?.dataUri;
    const imageName = path.basename(imageURI).split(".")[0];
    const layerName =
      store?.editor.activeDocument?.activeLayer?.title?.split(".")[0];
    const layerNameWithoutIndex = Number.isNaN(
      +(layerName?.split("_")[0] ?? ""),
    )
      ? layerName
      : layerName?.split("_").slice(1).join("_");
    const layerNameWithIndexedName = Number.isNaN(
      +(layerNameWithoutIndex?.split("_")[0] ?? ""),
    )
      ? `1_${layerNameWithoutIndex}`
      : layerNameWithoutIndex
          ?.split("_")
          .map((sub, index) => (index === 0 ? Number(sub) + 1 : sub))
          .join("_");
    return `/annotations/${imageName}/${
      layerNameWithIndexedName || "annotation"
    }`;
  }, [store]);

  useEffect(() => {
    if (isOpen) {
      setnewAnnotationURIPrefix(getAnnotationURIPrefixSuggestion());
    }
  }, [isOpen, getAnnotationURIPrefixSuggestion]);

  const isValidDataUri = useCallback(
    (dataUri, allowedExtensions = [".nii.gz", ".zip"]) => {
      const extensionsPattern = `(${allowedExtensions.join("|")})`;

      const pattern = new RegExp(
        `^((/|./)?([a-zA-Z0-9-_]+/)*([a-zA-Z0-9-_]+)${extensionsPattern})$`,
      );

      return pattern.test(dataUri)
        ? "valid"
        : translate("data_uri_help_message");
    },
    [translate],
  );

  const isValidAnnotationUri = useMemo(
    () => isValidDataUri(newDataUri),
    [newDataUri, isValidDataUri],
  );

  return (
    <SavePopUpContainer
      titleTx="annotation-saving"
      isOpen={isOpen}
      dismiss={onClose}
      shouldDismissOnOutsidePress
    >
      <SectionLabel tx="layers-to-save" />
      <LayerList
        layers={store?.editor.activeDocument?.activeLayer?.getFamilyLayers()}
      />
      {canBeOverwritten() && (
        <>
          <SectionLabel tx="annotation-saving-overrwite" />
          <InlineRow>
            <SaveInput
              value={
                store?.editor.activeDocument?.activeLayer?.family?.metaData
                  ?.dataUri
              }
              readOnly
            />
            <SaveButton
              tx="save"
              isDisabled={
                !store?.editor.activeDocument?.activeLayer?.family?.hasChanges
              }
              onPointerDown={async () => {
                if (await saveAnnotation()) {
                  onClose?.();
                }
              }}
            />
          </InlineRow>
        </>
      )}
      <SectionLabel tx="annotation-saving-as" />
      {isValidAnnotationUri !== "valid" && <Text text={isValidAnnotationUri} />}
      <InlineRowLast>
        <SaveAsInput
          placeholder="URI"
          value={newAnnotationURIPrefix}
          onChangeText={setnewAnnotationURIPrefix}
        />
        <StyledDropDown
          options={fileExtensions}
          defaultValue={selectedExtension}
          onChange={(value) => setSelectedExtension(value)}
          size="medium"
          borderRadius="default"
          isDisableMixin
        />
        <SaveButton
          tx="save-as"
          onPointerDown={async () => {
            if (await saveAnnotationAs(newDataUri)) {
              onClose?.();
            }
          }}
          isDisabled={isValidAnnotationUri !== "valid"}
        />
      </InlineRowLast>
    </SavePopUpContainer>
  );
});
