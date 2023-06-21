import {
  Button,
  ILayer,
  List,
  ListItem,
  PopUp,
  Text,
  TextField,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import path from "path";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { importFilesToDocument } from "../../../import-handling";
import { LayerFamily } from "../../../models/editor/layer-families";
import { patchAnnotationFile, postAnnotationFile } from "../../../queries";
import { Annotation, FileWithMetadata } from "../../../types";
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

const LayersToSaveList = styled(List)`
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  user-select: none;
  margin-bottom: 10px;
`;

const LayerToSaveItem = styled(ListItem)`
  height: 30px;
`;

export const SavePopUp = observer<SavePopUpProps>(({ isOpen, onClose }) => {
  const store = useStore();
  const [searchParams] = useSearchParams();
  const [newAnnotationURI, setnewAnnotationURI] = useState("");

  const { t } = useTranslation();

  const getOrphanAnnotationLayers = useCallback(() => {
    const orphanAnnotationLayers = store?.editor.activeDocument?.layers.filter(
      (l) => l.isAnnotation && !l.family,
    );
    return orphanAnnotationLayers ?? [];
  }, [store]);

  const getFamilyLayersOf = useCallback(
    (layer: ILayer | undefined) => {
      if (!layer) return [];
      return layer.family?.layers ?? getOrphanAnnotationLayers();
    },
    [getOrphanAnnotationLayers],
  );

  const createFamilyForNewAnnotation = (
    layer: ILayer | undefined,
    annotation: Annotation | undefined,
  ) => {
    const document = store?.editor.activeDocument;
    if (document && layer) {
      const layerFamily = new LayerFamily(document);
      document.addLayerFamily(layerFamily);
      if (annotation) {
        layerFamily.title = annotation.dataUri;
        layerFamily.metaData = annotation;
      }
      const familyLayers = layer.family?.layers ?? getOrphanAnnotationLayers();
      familyLayers.forEach((l) => layerFamily.addLayer(l.id));
      return layerFamily;
    }
  };

  const createFileForFamilyOf = async (
    layer: ILayer | undefined,
  ): Promise<File | undefined> => {
    if (layer?.isAnnotation) {
      const layersToSave = getFamilyLayersOf(layer);
      const file = await store?.editor?.activeDocument?.createFileFromLayers(
        layersToSave,
      );
      return file;
    }
  };

  const checkAnnotationURI = (file: File, uri: string) => {
    if (path.extname(uri) !== path.extname(file.name)) {
      throw new Error(
        `URI does not match file type ${path.extname(file.name)}`,
      );
    }
  };

  const importSavedAnnotationFile = (
    annotationFile: File,
    metaData: Annotation,
  ) => {
    const savedAnnotationFile = new File([annotationFile], metaData.dataUri, {
      type: annotationFile.type,
    }) as FileWithMetadata;
    savedAnnotationFile.metadata = metaData;
    const fileTransfer = new DataTransfer();
    fileTransfer.items.add(savedAnnotationFile);
    if (store) {
      importFilesToDocument(fileTransfer.files, store);
    }
  };

  const canBeOverwritten = useCallback(() => {
    const activeLayer = store?.editor.activeDocument?.activeLayer;
    const annotation = activeLayer?.family?.metaData as Annotation;
    if (!annotation) return false;
    const fileExt = path.extname(annotation.dataUri);
    const newFileExt =
      getFamilyLayersOf(activeLayer).length > 1 ? ".zip" : ".gz";
    return fileExt === newFileExt;
  }, [getFamilyLayersOf, store]);

  const saveAnnotation = async () => {
    store?.setProgress({ labelTx: "saving" });
    try {
      const activeLayer = store?.editor.activeDocument?.activeLayer;
      const annotationMeta = activeLayer?.family?.metaData as Annotation;
      const annotationFile = await createFileForFamilyOf(activeLayer);
      if (!annotationMeta || !annotationFile) {
        throw new Error("Could not create annotation file");
      }
      checkAnnotationURI(annotationFile, annotationMeta.dataUri);
      const response = await patchAnnotationFile(
        annotationMeta,
        annotationFile,
      );
      return response;
    } catch (error: any) {
      const description = error.response?.data?.message
        ? error.response.data.message
        : error.message
        ? error.message
        : "annotation-saving-error";
      store?.setError({
        titleTx: "saving-error",
        descriptionTx: description,
      });
    } finally {
      store?.setProgress();
    }
  };

  const saveAnnotationAs = async (uri: string) => {
    store?.setProgress({ labelTx: "saving" });
    try {
      const activeLayer = store?.editor.activeDocument?.activeLayer;
      const imageId = searchParams.get("imageId");
      const annotationFile = await createFileForFamilyOf(activeLayer);
      if (!imageId || !annotationFile) {
        throw new Error("Could not create annotation file");
      }
      checkAnnotationURI(annotationFile, uri);
      const responseData = await postAnnotationFile(
        imageId,
        uri,
        annotationFile,
      );
      const annotationMeta = activeLayer?.family?.metaData as Annotation;
      if (!annotationMeta) {
        createFamilyForNewAnnotation(activeLayer, responseData);
      } else {
        importSavedAnnotationFile(annotationFile, responseData);
      }
      return responseData;
    } catch (error: any) {
      const description = error.response?.data?.message
        ? error.response.data.message
        : error.message
        ? error.message
        : "annotation-saving-error";
      store?.setError({
        titleTx: "saving-error",
        descriptionTx: description,
      });
    } finally {
      store?.setProgress();
    }
  };

  const getAnnotationURISuggestion = useCallback(() => {
    const activeLayer = store?.editor.activeDocument?.activeLayer;
    if (!activeLayer) {
      return "annotation.nii.gz";
    }
    const fileExt =
      getFamilyLayersOf(activeLayer).length > 1 ? ".zip" : ".nii.gz";
    const imageURI =
      store?.editor.activeDocument?.mainImageLayer?.metaData?.dataUri;
    const imageName = path.basename(imageURI).split(".")[0];
    const annotationLayerName =
      store?.editor.activeDocument?.activeLayer?.title?.split(".")[0];
    return `/annotations/${imageName}/${
      annotationLayerName ?? "annotation"
    }${fileExt}`;
  }, [store, getFamilyLayersOf]);

  useEffect(() => {
    if (isOpen) {
      setnewAnnotationURI(getAnnotationURISuggestion());
    }
  }, [isOpen, getAnnotationURISuggestion]);

  const isValidDataUri = useCallback(
    (dataUri, allowedExtensions = [".nii.gz", ".zip"]) => {
      const extensionsPattern = `(${allowedExtensions.join("|")})`;

      const pattern = new RegExp(
        `^((/|./)?([a-zA-Z0-9-_]+/)*([a-zA-Z0-9-_]+)${extensionsPattern})$`,
      );

      return pattern.test(dataUri)
        ? "valid"
        : `${t("data_uri_help_message")} ${allowedExtensions.join(", ")}.`;
    },
    [t],
  );

  const isValidAnnotationUri = useMemo(
    () => isValidDataUri(newAnnotationURI),
    [newAnnotationURI, isValidDataUri],
  );

  return (
    <SavePopUpContainer
      titleTx="annotation-saving"
      isOpen={isOpen}
      dismiss={onClose}
      shouldDismissOnOutsidePress
    >
      <SectionLabel tx="layers-to-save" />
      <LayersToSaveList>
        {getFamilyLayersOf(store?.editor.activeDocument?.activeLayer).map(
          (layer) => (
            <LayerToSaveItem
              key={layer.id}
              label={layer.title}
              isLast
              icon={{
                color: layer.color || "text",
              }}
            />
          ),
        )}
      </LayersToSaveList>

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
          value={newAnnotationURI}
          onChangeText={setnewAnnotationURI}
        />
        <SaveButton
          tx="save-as"
          onPointerDown={async () => {
            if (await saveAnnotationAs(newAnnotationURI)) {
              onClose?.();
            }
          }}
          isDisabled={isValidAnnotationUri !== "valid"}
        />
      </InlineRowLast>
    </SavePopUpContainer>
  );
});
