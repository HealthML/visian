import {
  Button,
  DropDown,
  ILayer,
  List,
  ListItem,
  PopUp,
  Text,
  TextField,
  useTranslation,
} from "@visian/ui-shared";
import { AxiosError } from "axios";
import { observer } from "mobx-react-lite";
import path from "path";
import { useCallback, useEffect, useMemo, useState } from "react";
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

const StyledDropDown = styled(DropDown)`
  margin: 0px 10px 0px 0px;
  width: 200px;
`;

export const SavePopUp = observer<SavePopUpProps>(({ isOpen, onClose }) => {
  const store = useStore();
  const [searchParams] = useSearchParams();
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

  const { t } = useTranslation();

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
      const familyLayers = layer.getFamilyLayersOf();
      familyLayers.forEach((l) => layerFamily.addLayer(l.id));
      return layerFamily;
    }
  };

  const createFileForFamilyOf = async (
    layer: ILayer | undefined,
    asZip: boolean,
  ): Promise<File | undefined> => {
    if (layer?.isAnnotation) {
      const layersToSave = layer.getFamilyLayersOf();
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

  const importSavedAnnotationFile = (
    annotationFile: File,
    metaData: Annotation,
  ) => {
    const savedAnnotationFile = new File(
      [annotationFile],
      metaData.dataUri.split("/").pop() ?? "",
      {
        type: annotationFile.type,
      },
    ) as FileWithMetadata;
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
    return !!annotation;
  }, [store]);

  const saveAnnotation = async () => {
    store?.setProgress({ labelTx: "saving" });
    try {
      const activeLayer = store?.editor.activeDocument?.activeLayer;
      const annotationMeta = activeLayer?.family?.metaData as Annotation;
      const annotationFile = await createFileForFamilyOf(
        activeLayer,
        annotationMeta?.dataUri.endsWith(".zip"),
      );
      if (!annotationMeta || !annotationFile) {
        throw new Error(translate("create-annotation-error"));
      }
      checkAnnotationURI(annotationFile, annotationMeta.dataUri);
      const response = await patchAnnotationFile(
        annotationMeta,
        annotationFile,
      );
      return response;
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

  const saveAnnotationAs = async (uri: string) => {
    store?.setProgress({ labelTx: "saving" });
    try {
      const activeLayer = store?.editor.activeDocument?.activeLayer;
      const imageId = searchParams.get("imageId");
      const annotationFile = await createFileForFamilyOf(
        activeLayer,
        uri.endsWith(".zip"),
      );
      if (!imageId || !annotationFile) {
        throw new Error(translate("create-annotation-error"));
      }
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

      return pattern.test(dataUri) ? "valid" : t("data_uri_help_message");
    },
    [t],
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
      <LayersToSaveList>
        {store?.editor.activeDocument?.activeLayer
          ?.getFamilyLayersOf()
          .map((layer) => (
            <LayerToSaveItem
              key={layer.id}
              label={layer.title}
              isLast
              icon={{
                color: layer.color || "text",
              }}
            />
          ))}
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
